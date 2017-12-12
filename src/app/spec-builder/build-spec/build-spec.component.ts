import { Component, Input, Output, HostListener, EventEmitter, OnChanges } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { AuthService } from '../../auth/auth.service';
import { MdSnackBar } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { KonvaService } from '../../konva/konva.service'
import * as firebase from 'firebase/app';
import constants from '../../../constants.js';

@Component({
  selector: 'app-build-spec',
  templateUrl: './build-spec.component.html',
  styleUrls: ['./build-spec.component.css']
})
export class BuildSpecComponent implements OnChanges {
	@Input() selectedBoard: object;
	@Input() selectedSpec: object;
	@Input() pieces = new Array();
	@Output() onPiecesSet = new EventEmitter<object>();

	zPos:number = 2;
	container:string = 'board-overlay';
	newStage: boolean = true;
	dragged: boolean = false;
	allPieces: object;
	deckElementPieces: object[] = new Array()
	nonDeckElementPieces: object[] = new Array();
	images: object[] = new Array();
	elements: object[] = new Array();
	imageData = new Map<string, object>();
	elementData = new Map<string, object>();
	elementImageIndex = new Map<string, object>();
	elementsRef: FirebaseListObservable<any[]>;
	imagesRef: FirebaseListObservable<any[]>;

	currentFilter = 'all';
	options = [
		{value: 'all', viewValue: 'All Elements'},
		{value: 'mine', viewValue: 'My Uploads'},
		{value: 'standard', viewValue: 'Standard'},
		{value: 'toggable', viewValue: 'Toggable'},
		{value: 'dice', viewValue: 'Dice'},
		{value: 'card', viewValue: 'Card'},
		{value: 'cardsDeck', viewValue: 'Cards Deck'},
		{value: 'piecesDeck', viewValue: 'Pieces Deck'},
	]

	constructor(
		private auth: AuthService, 
		private db: AngularFireDatabase,
		private snackBar: MdSnackBar,
		private konva: KonvaService,
	) {

  		if(this.auth.authenticated) {

  			konva.specUpdateObs$.subscribe( data => {
  				this.updateSpec(data);
  			});

  			let p = new Promise( (resolve, reject) => {

	  			this.imagesRef = db.list(constants.IMAGES_PATH, {
					query: {
						orderByChild: 'isBoardImage',
						equalTo: false,
					},
					preserveSnapshot: true
				});

				this.imagesRef.subscribe(snapshot => {
					console.log('creating image array');
					snapshot.forEach(data => {
						this.images.push(data.val());
						this.imageData.set(data.key, {
							'downloadURL': data.val().downloadURL,
							'name': data.val().name
						});
						if(this.imageData.size === snapshot.length)
							resolve("Got images!");
					})
				})
			});

			p.then( (msg) => {
				console.log(msg);
				
				this.elementsRef = db.list(constants.ELEMENTS_PATH, {
					query: this.buildQuery(),
					preserveSnapshot: true
				})

				this.elementsRef.subscribe(snapshot => {
					console.log('creating element array');
					snapshot.forEach(data => {
						let element = data.val();
						element['_key'] = data.key;
						let key = element.images[0]['imageId'];
						let img = this.imageData.get(key);
						
						if(img !== undefined) {
							element['downloadURL'] = img['downloadURL'];
							element['name'] = img['name'];
							this.elements.push(element);
							this.elementData.set(data.key, element);
							this.elementImageIndex.set(data.key, {
								'current': 0,
								'max': (element.images.length - 1),
							});
						}
					})
				});
			}).catch( (error) => {
				console.log("something went wrong... " + error);
			})
		}
	}

	ngOnChanges() {
		console.log('on changes');

		if(this.pieces.length !== 0 && this.newStage) {
			this.newStage = false;
			let tempPieces = this.formatPieces();
			this.konva.buildStageWithPieces(this.container, tempPieces);
		}
	}

	onChange(value){
		this.currentFilter = value;
		console.log("current filter: " + this.currentFilter);

		let p = new Promise( (resolve, reject) => {

			this.elementsRef = this.db.list(constants.ELEMENTS_PATH, {
				query: this.buildQuery(),
				preserveSnapshot: true
			})

			this.elements = new Array()

			this.elementsRef.subscribe(snapshot => {
				console.log('updating element array');
				snapshot.forEach(data => {
					let element = data.val();
					element['_key'] = data.key;
					let key = element.images[0]['imageId'];
					let img = this.imageData.get(key);
					
					if(img !== undefined) {
						element['downloadURL'] = img['downloadURL'];
						element['name'] = img['name'];
						this.elements.push(element);
						this.elementData.set(data.key, element);
						this.elementImageIndex.set(data.key, {
							'current': 0,
							'max': (element.images.length - 1),
						});
					}
				})
			});
		})
	}

	formatPieces() {
		console.log('formatting');
		let tempPieces = new Array();
		for(let piece of this.pieces) {
			let elem = this.elementData.get(piece['pieceElementId']);
			let formattedPiece = {
	            "el_key": elem["_key"],
	            "url": elem["downloadURL"],
	            "xPos": piece['initialState']['x'],
	            "yPos": piece['initialState']['y'],
	            "zPos": piece['initialState']['zDepth'],
	            "index": this.elementImageIndex.get(elem["_key"])["current"],
	            "deckIndex": piece['deckPieceIndex']
	        }

			if(piece['deckPieceIndex'] === -1) {
				let width, height, xPos, yPos, tempPiece = {};
				this.nonDeckElementPieces.push(formattedPiece);

				[width, height] = this.resizeImage(elem);
				[xPos, yPos] = this.descaleCoord(
					piece['initialState']['x'],
					piece['initialState']['y']
				);
				tempPiece['xPos'] = xPos;
				tempPiece['yPos'] = yPos;
				tempPiece['width'] = width;
				tempPiece['height'] = height;
				tempPiece['src'] = elem['downloadURL'];
				tempPieces.push(tempPiece);

			}
			else {
				this.deckElementPieces.push(formattedPiece);
			}
		}
		
		this.allPieces = new Object({
			'nonDeck': this.nonDeckElementPieces,
			'deck': this.deckElementPieces
		})
        this.onPiecesSet.emit(this.allPieces);

		return tempPieces;
	}

	updateSpec(data) {
		console.log('updating pieces');
		console.log(data);
		let konvaImages = data[0];
		let imageIndex = data[1];
		let action = data[2];
		let konvaImg, konvaImgId = this.getIdFromIndex(imageIndex);

		for(let tempImg of konvaImages) {
			if(tempImg._id === konvaImgId) {
				konvaImg = tempImg;
				break;
			}
		}

		let xPos = konvaImg.attrs['x'];
		let yPos = konvaImg.attrs['y'];

		let curPiece = this.nonDeckElementPieces[imageIndex];
		let key = curPiece['el_key'];
		let elem = this.elementData.get(key);
		let type = elem['elementKind'];

		curPiece['zPos'] = this.zPos++;

		if(type === 'standard' || type.endsWith('Deck')) {
			console.log('do nothing here');
		}
		/* Handle Toggling */
		else if(action === 'toggled') {

			let altIndex = this.getImageIndex(key);
			let images = elem['images'];

			let newURL = this.imageData.get(images[altIndex]['imageId'])['downloadURL'];
			curPiece['url'] = newURL;
			curPiece['index'] = this.elementImageIndex.get(key)["current"];

			this.konva.updateImage(konvaImgId, newURL);
		}

		//update piece
		[xPos, yPos] = this.scaleCoord(xPos, yPos);
		console.log("final: " + xPos + " " + yPos);
		curPiece['xPos'] = xPos; curPiece['yPos'] = yPos;
		if(type.endsWith('Deck')) {
			if(type === 'cardsDeck') {
				for(let el of this.deckElementPieces) {
					if(el['deckIndex'] === imageIndex) {
						el['xPos'] = xPos;
						el['yPos'] = yPos;
					}
				}
			}
			else { //type === 'piecesDeck'
				/*
				** should there be special handling of placement
				** for pieceElement vs cardElement ?
				*/
				for(let el of this.deckElementPieces) {
					if(el['deckIndex'] === imageIndex) {
						el['xPos'] = xPos;
						el['yPos'] = yPos;
					}
				}
			}
		}
		this.nonDeckElementPieces[imageIndex] = curPiece;

		this.allPieces = new Object({
			'nonDeck': this.nonDeckElementPieces,
			'deck': this.deckElementPieces
		})
        this.onPiecesSet.emit(this.allPieces);

	}

	@HostListener('dragstart', ['$event'])
	onDragStart(event) {
		if(this.newStage) {
			this.newStage = false;
			this.konva.buildStage(this.container);
		}

		console.log("component dragstart");
		this.dragged = true;
		
        //event.target.classList.add('currentlyDragged');
        let url = event.target.getAttribute('src');
        let key = event.target.getAttribute('alt');

        console.log('key:' + key + ' url:' + url);
        event.dataTransfer.setData(
        	"data", JSON.stringify({'key': key, 'url': url})
        );
	}

	/*
	@HostListener('dragend', ['$event'])
    onDragEnd(event) {
    	console.log("dragend");

	}

	@HostListener('dragenter', ['$event'])
	onDragEnter(event) {
		console.log("drag enter");
	}

	@HostListener('dragleave', ['$event'])
	onDragLeave(event) {
		console.log("drag leave");
	}
	*/

  	@HostListener('drop', ['$event'])
	onDrop(event) {
		console.log("component drop");

		if(event.preventDefault)
			event.preventDefault();
        if(event.stopPropagation)
        	event.stopPropagation();
		
		let elem, xPos, yPos, width, height, deckIndex, type;

		let data = event.dataTransfer.getData("data");
        data = JSON.parse(data);
        elem = this.elementData.get(data['key']);
        type = elem['elementKind'];


        [xPos, yPos] = this.calculatePosition(event);
        [width, height] = this.resizeImage(elem);


		if(type === 'piecesDeck' || type === 'cardsDeck') {
			let deckX, deckY;
			[deckX, deckY] = this.scaleCoord(xPos, yPos);
			let piece = {
	            "el_key": data["key"],
	            "url": data["url"],
	            "xPos": deckX,
	            "yPos": deckY,
	            "zPos": this.zPos++,
	            "index": this.elementImageIndex.get(data["key"])["current"],
	            "deckIndex": -1 //non deck-pieces only
	        }

	        //add deck to Konva canvas
	        let imageObj = {
	        	'xPos': xPos,
	        	'yPos': yPos,
	        	'src': data['url'], 
	        	'width': width,
	        	'height': height
	        }
	        this.konva.onDrop(imageObj);
	        
	        //add deck to peices array
        	this.nonDeckElementPieces.push(piece);

        	let deckPieceIndex = this.nonDeckElementPieces.length - 1;
			let deckElements = this.getDeck(data['key']);
			let resized = this.resizeDeck(deckElements)
			
			// Add deck elements to Konva canvas
			if(type === 'cardsDeck') {
				/* uncomment to place deckElements directly on board */
				//this.konva.onCardDeckDrop(resized, xPos, yPos);
				[xPos, yPos] = this.scaleCoord(xPos, yPos);

				// cards are stacked on top of each other
				for(let el of deckElements) {
					let piece = {
			    		"el_key": el["_key"],
			    		"url": el["downloadURL"],
			    		"xPos": xPos,
			    		"yPos": yPos,
			    		"zPos": this.zPos++,
			    		"index": this.elementImageIndex.get(data["key"])["current"],
			    		"deckIndex": deckPieceIndex
		    		}
					this.deckElementPieces.push(piece);
				}
			}
			else {
				/* uncomment to place deckElements directly on board */
				//this.konva.onPiecesDeckDrop(resized, xPos, yPos);
				[xPos, yPos] = this.scaleCoord(xPos, yPos);

				// pieces are layered on top of each other
				for(let el of deckElements) {
					let piece = {
			    		"el_key": el["_key"],
			    		"url": el["downloadURL"],
			    		"xPos": xPos,
			    		"yPos": yPos,
			    		"zPos": this.zPos++,
			    		"index": this.elementImageIndex.get(data["key"])["current"],
			    		"deckIndex": deckPieceIndex
		    		}
					this.deckElementPieces.push(piece);
				}
			}
		}

		else { //add non-deck pieces to canvas

			let imageObj = {
	        	'xPos': xPos,
	        	'yPos': yPos,
	        	'src': data['url'], 
	        	'width': width,
	        	'height': height
	        }
	        this.konva.onDrop(imageObj);
	        [xPos, yPos] = this.scaleCoord(xPos, yPos);

	    	let piece = {
	            "el_key": data["key"],
	            "url": data["url"],
	            "xPos": xPos,
	            "yPos": yPos,
	            "zPos": this.zPos++,
	            "index": this.elementImageIndex.get(data["key"])["current"],
	            "deckIndex": -1 //non deck-pieces only
	        }
	        this.nonDeckElementPieces.push(piece);
	    }
	    this.allPieces = new Object({
			'nonDeck': this.nonDeckElementPieces,
			'deck': this.deckElementPieces
		})
        this.onPiecesSet.emit(this.allPieces);
	}

	getDeck(key) {
		let deckElements = new Array();
		let deck = this.elementData.get(key);
		for(let el of deck['deckElements']) {
			let deckElement = this.elementData.get(el['deckMemberElementId']);
			deckElements.push(deckElement);
		}
		return deckElements;
	}

	resizeDeck(deckElements) {
		let resized = new Array();

		for(let el of deckElements) {
			let el2 = Object.create(el);
			[el2['width'], el2['height']] = this.resizeImage(el);
			resized.push(el2);
		}

		return resized;
	}

	getImageIndex(key) {
		let indexData = this.elementImageIndex.get(key);
		let cur = indexData['current'];
		let max = indexData['max'];

		cur = (cur < max) ? (cur + 1) : 0;

		this.elementImageIndex.set(key, {
			'current': cur,
			'max': max
		});

		return cur;
	}

	scaleCoord(xPos, yPos) {
		xPos = (xPos * 100) / 512;
		yPos = (yPos * 100) / 512;
		return [xPos, yPos];
	}

	descaleCoord(xPos, yPos) {
		xPos = (xPos / 100) * 512;
		yPos = (yPos / 100) * 512;
		return [xPos, yPos];
  }

	calculatePosition(event) {
		let xPos = event.clientX;
		let yPos = event.clientY;
		let container = document.getElementById("board-overlay");
		let offsets = container.getBoundingClientRect();

		console.log("mouse: " + xPos + " " + yPos);
		console.log("container: " + offsets.left + " " + offsets.top);
		console.log("scroll: " + window.scrollY);

		xPos = xPos - offsets.left - 25;
		let offsetCalc = offsets.top + window.scrollY;
		yPos = (yPos + window.scrollY) - offsetCalc - 25;

		console.log("fixed: " + xPos + " " + yPos + " " + (this.zPos + 1));

		return [xPos, yPos];
	}

	resizeImage(elem) {
		let width = elem['width'] / 2;
		let height = elem['height'] / 2;
		return [width, height];

	}

	/*  DEPRECATED
	fromSource(id) {
		return (id.indexOf('copy') > -1) ? false : true;
	}
	*/

	/*  DEPRECATED
	copyElement(data, id) {
		let elem = document.getElementById(id).cloneNode(true);
		(elem as HTMLElement).id = (elem as HTMLElement).id + 'copy' + this.uniqueID;
        (elem as HTMLElement).setAttribute("src", data["url"]);
        (elem as HTMLElement).setAttribute("alt", data["key"]);
        this.uniqueID++;

        return elem;
	}
	*/
	/* DEPRECATED
	deleteElement(data, id) {
		if(this.fromSource(id))
			return
		console.log(data);
		this.piecesMap.delete(id);
		console.log(this.piecesMap);
        this.onPiecesSet.emit(this.piecesMap);
        document.getElementById(this.container).removeChild(
        	document.getElementById(id));
        this.deleteWarning(data);
	}
	*/

	buildQuery() {
		if(this.currentFilter === 'mine') {
			return {
				orderByChild: 'uploaderUid',
				equalTo: this.auth.currentUserId,
			}
		} 
		else if(this.currentFilter === 'all') {
			return {}
		}
		else {
			return {
				orderByChild: 'elementKind',
				equalTo: this.currentFilter,
			}
		}
	}

	getIdFromIndex(index) {
		return index + 3;
	}

	/* DEPRECATED
	deleteWarning(piece) {
    	this.snackBar.open("Removed " + piece['key'] + " from spec",
    		'Close', { duration: 1000 }
    	);
	}
	*/

}
