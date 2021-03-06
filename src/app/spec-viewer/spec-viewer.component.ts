import { Component, Input, Output, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs/Observable';
import { MdSnackBar } from '@angular/material';
import * as firebase from 'firebase/app';
import constants from '../../constants.js';
import {ViewSpecComponent} from './view-spec/view-spec.component';

import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
	selector: 'app-spec-viewer',
	templateUrl: './spec-viewer.component.html',
	styleUrls: ['./spec-viewer.component.css']
})
export class SpecViewerComponent implements OnInit {
	isLinear = true;
    selected = false;
    piecesSet = false;
	firstFormGroup: FormGroup;
	secondFormGroup: FormGroup;
	thirdFormGroup: FormGroup;
	selectedSpec: object = {};
	selectedBoard: object = {};
	pieces: object[] = new Array();
	deckSet = new Set<string>();
	blocked: boolean;
	@ViewChild(ViewSpecComponent) child: ViewSpecComponent;

	constructor(
		private auth: AuthService,
		private _formBuilder: FormBuilder,
		private db: AngularFireDatabase,
        private snackBar: MdSnackBar
	) {	}

	ngOnInit() {
    this.blocked = this.auth.isAnonymous || !this.auth.authenticated;
		this.firstFormGroup = this._formBuilder.group({
			firstCtrl: ['', Validators.required]
		});
		this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required]
    });
    this.thirdFormGroup = this._formBuilder.group({
      thirdCtrl: ['', Validators.required]
    });
  }

  	onSpecSelected(spec: object) {
		this.child.reset()
        this.selected = true;
        this.selectedSpec = spec;
	    //console.log(this.selectedSpec);
	    this.firstFormGroup = this._formBuilder.group({
            firstCtrl: ['validated', Validators.required]
        });
		  console.log("receiving spec");
		
  	}

    onBoardSelected(board: object) {
        this.selectedBoard = board;
        console.log("receiving board");
    }

    onPiecesSelected(pieces: object[]) {
        this.pieces = pieces;
        console.log('receiving pieces');
	}
	
	onDeckSelected(deckSet: Set<string>){
		this.deckSet = deckSet
		console.log('received deck set')
	}

  	onPiecesSet(piecesObj: object) {
        let uid = this.selectedSpec['uploaderUid'];
		this.pieces = piecesObj['nonDeck'].concat(piecesObj['deck']);

		if(this.pieces.length > 0 && uid === this.auth.currentUserId) {
        	this.secondFormGroup = this._formBuilder.group({
        		secondCtrl: ['validated', Validators.required]
        	});
      	}
  		console.log("updating pieces");
  	}

  	getSelectedBoard() {
  		return this.selectedBoard;
  	}

    getSelectedSpec() {
        return this.selectedSpec;
    }

  	getPieces() {
  		return this.pieces;
  	}

	getPiecesSet() {
    	return this.piecesSet;
   	}

	getDeckSet(){
		return this.deckSet
	}
	
    firstWarning() {
    	if(this.isEmptyObject(this.selectedSpec)) {
        	this.snackBar.open("You must select a spec.", 'Close', { 
        		duration: 1000,
        	});
        }
	}

	secondWarning() {
        let uid = this.selectedSpec['uploaderUid'];
        if(uid !== this.auth.currentUserId) {
		    this.snackBar.open("You may only modify your own specs.", 'Close', {
                duration: 1000,
            });
        }
        else if(this.pieces.length === 0) {
      		this.snackBar.open("You must place at least one element.", 'Close', {
        		duration: 1000,
      		});
    	}
    	else {
            console.log('pieces?');
            console.log(this.pieces);
      		this.piecesSet = true;
        }
  	}

	reset() {
		this.pieces = new Array();
		console.log('resetting');
	}

  /*
  ** https://stackoverflow.com/questions/44337856/check-if-specific-object-is-empty-in-typescript
  */
  	isEmptyObject(obj) {
    	for(var prop in obj) {
       		if (obj.hasOwnProperty(prop)) {
          		return false;
       		}
    	}
    	return true;
	}

}
