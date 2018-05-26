//
//  GameViewController.swift
//  blackJack
//
//  Created by victor.tsai on 5/26/18.
//  Copyright © 2018 victor.tsai. All rights reserved.
//

import UIKit
import SpriteKit
import GameplayKit

class GameViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        // let scene = GameScene(size: CGSize(width: 768, height:1024))
        let scene = GameScene(size: CGSize(width: 550, height:1024))

        let skView = self.view as! SKView
        skView.showsFPS = false
        skView.showsNodeCount = false
        skView.ignoresSiblingOrder = false
        scene.scaleMode = .aspectFill
        skView.presentScene(scene)
    }

    override var prefersStatusBarHidden: Bool {
        return true
    }
}
