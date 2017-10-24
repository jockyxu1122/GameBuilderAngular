import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../auth/auth.service';
import * as firebase from 'firebase/app';
import constants from '../../constants.js'

import {FormBuilder, FormGroup, Validators} from '@angular/forms';



@Component({
  selector: 'app-spec-builder',
  templateUrl: './spec-builder.component.html',
  styleUrls: ['./spec-builder.component.css']
})
export class SpecBuilderComponent implements OnInit {
	isLinear = false;
	firstFormGroup: FormGroup;
	secondFormGroup: FormGroup;
	thirdFormGroup: FormGroup;
	selectedBoard: object = new Object();
	pieces: object[] = new Array();

	constructor(
		private auth: AuthService,
		private _formBuilder: FormBuilder,
		public db: AngularFireDatabase
	) {	}

	ngOnInit() {
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

  	onSelected(board: object) {
  		this.selectedBoard = board
  		console.log("receiving board");
  	}

  	onPiecesSet(piece: object) {
  		this.pieces.push(piece)
  		console.log("adding pieces to array");
  	}

  	getSelectedBoard() {
  		return this.selectedBoard;
  	}

  	getPieces() {
  		return this.pieces;
  	}

}