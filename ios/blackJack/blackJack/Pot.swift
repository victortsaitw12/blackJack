//
//  Pot.swift
//  blackJack
//
//  Created by victor.tsai on 5/26/18.
//  Copyright © 2018 victor.tsai. All rights reserved.
//

class Pot {
    private var pot = 0;
    func addMoney(amount: Int){
        pot += amount
    }
    func getMoney()->Int{
        return pot
    }
    func reset(){
        pot = 0
    }
}
