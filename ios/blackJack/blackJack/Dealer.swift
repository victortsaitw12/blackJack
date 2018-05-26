//
//  Dealer.swift
//  blackJack
//
//  Created by victor.tsai on 5/26/18.
//  Copyright © 2018 victor.tsai. All rights reserved.
//

import Foundation

class Dealer: GenericPlayer{
    private var firstCard = Card(suit: "card_front", value: 0)
    
    override init(hand: Hand){
        super.init(hand: hand)
    }
    
    func setFirstCard(card: Card){
        firstCard = card
    }
    
    func getFirstCard()->Card{
        return firstCard
    }
}
