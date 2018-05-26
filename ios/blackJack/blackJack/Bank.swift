//
//  Bank.swift
//  blackJack
//
//  Created by victor.tsai on 5/26/18.
//  Copyright © 2018 victor.tsai. All rights reserved.
//

import Foundation

class Bank{
    var balance = 500
    
    init(){
        
    }
    
    func resetBalance(){
        balance = 500
    }
    
    func addMoney(amount: Int){
        balance += amount
    }
    
    func substractMoney(amount: Int){
        balance -= amount
        if(balance <= 10){
            resetBalance()
        }
    }
    
    func getBalance()->Int{
        return balance
    }
}
