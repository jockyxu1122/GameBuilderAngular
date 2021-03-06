import {environment} from '../environments/environment';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { AngularFireModule} from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { RouterModule, Routes } from '@angular/router';
import { provideRoutes } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AuthService } from './auth/auth.service';
import { KonvaService } from './konva/konva.service';
import { ImageSelectionService } from './image-select/imageSelection.service'
//import firebaseConfig from '../config.js';
//import * as firebase from 'firebase/app';

import { AppComponent } from './app.component';
import { PhoneloginComponent } from './phonelogin/phonelogin.component';
import { UserInfoComponent } from './user-info/user-info.component';
import { UserLoginComponent } from './user-login/user-login.component';
import { GoogleLoginComponent } from './google-login/google-login.component';
import { UploadImageComponent } from './upload-image/upload-image.component';
import { SpecBuilderComponent } from './spec-builder/spec-builder.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MdButtonModule,
  MdCheckboxModule,
  MdIconModule,
  MdInputModule,
  MdListModule,
  MdGridListModule,
  MdProgressSpinnerModule,
  MdRadioModule,
  MdStepperModule,
  MdTooltipModule,
  MdSelectModule,
  MdSnackBarModule,
} from '@angular/material';
import { SelectBoardComponent } from './spec-builder/select-board/select-board.component';
import { BuildSpecComponent } from './spec-builder/build-spec/build-spec.component';
import { FinalizeSpecComponent } from './spec-builder/finalize-spec/finalize-spec.component';
import { CreateElementComponent } from './create-element/create-element.component';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { SpecViewerComponent } from './spec-viewer/spec-viewer.component';
import { SpecSelectorComponent } from './spec-viewer/spec-selector/spec-selector.component';
import { ViewSpecComponent } from './spec-viewer/view-spec/view-spec.component';
import { UploadSpecComponent } from './spec-viewer/upload-spec/upload-spec.component';
import { SpecEditorComponent } from './spec-editor/spec-editor.component';
import { SelectSpecComponent } from './spec-editor/select-spec/select-spec.component';


/*
//OLD SPEC CONFIG
export const firebaseConfig = {
    apiKey: "AIzaSyD6Q8YS9-rbhCXFR5crQLp-5oUfGaNyDKQ",
    authDomain: "tutorial-6ea2e.firebaseapp.com",
    databaseURL: "https://tutorial-6ea2e.firebaseio.com",
    projectId: "tutorial-6ea2e",
    storageBucket: "tutorial-6ea2e.appspot.com",
    messagingSenderId: "424710997339"
};
*/

export const firebaseConfig = { 
    apiKey: "AIzaSyDA5tCzxNzykHgaSv1640GanShQze3UK-M",
    authDomain: "universalgamemaker.firebaseapp.com",
    databaseURL: "https://universalgamemaker.firebaseio.com",
    projectId: "universalgamemaker",
    storageBucket: "universalgamemaker.appspot.com",
    messagingSenderId: "144595629077"
};

export const appRoutes: Routes = [
  {path: '', redirectTo: '/', pathMatch: 'full'},
  {path: 'app', component: AppComponent},
  {path: 'build', component: SpecBuilderComponent},
  {path: 'createElement', component: CreateElementComponent},
  {path: 'googleLogin', component: GoogleLoginComponent},
  {path: 'login', component: UserLoginComponent},
  {path: 'phonelogin', component: PhoneloginComponent},
  {path: 'uploadImage', component: UploadImageComponent},
  {path: 'user', component: UserInfoComponent},
  {path: 'viewSpec', component: SpecViewerComponent},
  {path: 'editSpec', component: SpecEditorComponent},
];

@NgModule({
  declarations: [
    AppComponent,
    PhoneloginComponent,
    UserInfoComponent,
    UserLoginComponent,
    GoogleLoginComponent,
    UploadImageComponent,
    SpecBuilderComponent,
    SelectBoardComponent,
    BuildSpecComponent,
    FinalizeSpecComponent,
    CreateElementComponent,
    SpecViewerComponent,
    SpecSelectorComponent,
    ViewSpecComponent,
    UploadSpecComponent,
    SpecEditorComponent,
    SelectSpecComponent,
  ],
  imports: [
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(appRoutes),
    BsDropdownModule.forRoot(),
    MdButtonModule,
    MdCheckboxModule,
    MdIconModule,
    MdInputModule,
    MdListModule,
    MdGridListModule,
    MdProgressSpinnerModule,
    MdRadioModule,
    MdStepperModule,
    MdTooltipModule,
    MdSelectModule,
    MdSnackBarModule,
    BrowserAnimationsModule,
  ],
  providers: [AuthService, KonvaService, ImageSelectionService],
  bootstrap: [AppComponent]
})
export class AppModule { }
