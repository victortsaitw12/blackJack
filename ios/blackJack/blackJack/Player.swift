//
//  Player.swift
//  blackJack
//
//  Created by victor.tsai on 5/26/18.
//  Copyright © 2018 victor.tsai. All rights reserved.
//

import Foundation

class Player: GenericPlayer {
    var bank:Bank
    private var yields = false
    private var canBet = false
    
    init(hand: Hand, bank: Bank){
        self.bank = bank
        super.init(hand: hand)
    }
    
    func setYielding(yields: Bool){
        self.yields = yields
    }
    
    func isYielding()->Bool{
        return yields
    }
    
    func setCanBet(canBet: Bool){
        self.canBet = canBet
    }
    
    func getCanBet()->Bool{
        return canBet
    }
}
