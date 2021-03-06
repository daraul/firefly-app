import { FireflyRemoteProvider } from "../providers/firefly-remote/firefly-remote";
import { Inject, Injectable } from "@angular/core";
import { Storage } from '@ionic/storage';
import { TransactionItemModel } from "./transactionItem.model";

@Injectable()
export class TransactionModel{

    public type: string;
    public description: string;
    public date: Date;
    public piggyBankId: Number;
    public transactions: TransactionItemModel[] = [];
    public synced: boolean = false;

    public constructor(@Inject(FireflyRemoteProvider) private fireflyService, @Inject(Storage) private storage){
    }

    public save() {
        return new Promise((resolve,reject) => {    

            var data = {
                type: this.type,
                description: this.description,
                date: this.date,
                piggy_bank_id: this.piggyBankId,
                transactions: this.transactions
            }

            if(this.fireflyService.isConnected){
                this.fireflyService.postTransaction(data).then( () => {
                    this.synced = true;
                    return resolve("Transaction Created Successfully");
                }).catch( err => {
                    return resolve("An error was encountered while saving your transaction");
                });
            }
            else{
                this.storage.get("pendingTransactions").then( pendingTransactions => {
                    var pending = pendingTransactions;

                    if(pending == null || pending == undefined){
                        pending = [];
                    }

                    pending.push(data);
                    this.storage.set("pendingTransactions", pending);
                    return resolve("Transaction Queued");
                });
            }

        });
    }

    public loadFromQueue(queueData: any){
        this.type = queueData.type;
        this.description= queueData.description;
        this.date = queueData.date;
        this.piggyBankId = queueData.piggyBankId != '' ? queueData.piggyBankId : null;

        // Only 1 sub item can be added for now
        this.transactions = queueData.transactions;

        return this;
    }

    public loadFromForm(formData: any){
        this.type = formData.type;
        this.description= formData.description;
        this.date = formData.date;
        this.piggyBankId = formData.piggy_bank_id !== '' ? formData.piggy_bank_id : null;

        // Only 1 sub item can be added for now
        // Bug #230 - need to rethink how transaction model is instantiated. Use repo pattern.
        this.transactions = [ new TransactionItemModel(formData)];
        //this.transactions.push(new TransactionItemModel(formData));

        return this;
    }
}