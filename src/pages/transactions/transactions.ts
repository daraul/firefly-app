import { Component } from '@angular/core';
import { NavController, ToastController, LoadingController } from 'ionic-angular';
import { FireflyRemoteProvider } from '../../providers/firefly-remote/firefly-remote';
import { ModalController, Platform, NavParams, ViewController } from 'ionic-angular';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'page-home',
  templateUrl: 'transactions.html'
})

export class TransactionsPage {
  private transactionList: any;
  private loader: any;

  constructor(
    public navCtrl: NavController, 
    private fireflyService : FireflyRemoteProvider,
    private loadingCtrl: LoadingController)
  {

    this.loader = this.loadingCtrl.create({
      content: "Loading..."
    });

    this.getTransactions().then( () => {
      this.loader.dismiss();
    });
  }

  getTransactions(){
    return this.fireflyService.getTransactions().then((t) => {
      this.transactionList = t["data"];
    });
  }

  doRefresh(refresher){
    this.getTransactions().then( () => {
      refresher.complete();
    });
  }
}

@Component({
  templateUrl: 'add.html'
})

export class AddTransactionPage {
  private form : FormGroup;
  private accountList: any;

  constructor(
      public platform: Platform, 
      public params: NavParams, 
      public viewCtrl: ViewController, 
      private formBuilder: FormBuilder, 
      private fireflyService: FireflyRemoteProvider,
      private toastCtrl: ToastController
    )
  {
    this.buildForm();
    this.buildAccountDropDown();
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  save() {
    var formData = this.form.value;

    var data = {
      type: 'withdrawal',
      description: formData.description,
      date: formData.date,
      transactions: [
        {
          amount: formData.amount,
          source_id: formData.source,
          destination_id: '',
          currency_code: 'USD'
        }
      ]
    }

    this.fireflyService.postTransaction(data).then( () => {
      this.presentToast("Transaction Created Successfully");
      this.dismiss();
    }).catch( err => {
      this.presentToast(err);
    });
  }

  buildAccountDropDown()
  {
    return this.fireflyService.getAccounts().then( (data) => {
      this.accountList = data["data"];
    });
  }

  buildForm(){
    this.form = this.formBuilder.group({
      description: [''],
      source: [''],
      amount: [''],
      date: [ new Date().toISOString().slice(0,10) ]
    });
  }

  presentToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: "top"
    });
    toast.present();
  }
}
