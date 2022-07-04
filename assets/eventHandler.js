import { Action, MoveAction } from "./actions.js";

export class EventHandler {

    dispatch(inputType, inputData) {
        if (inputType === 'keydown') {
            if (inputData.keyCode === ROT.KEYS.VK_LEFT || inputData.keyCode === ROT.KEYS.VK_A) {
                return new MoveAction(-1, 0);
            } else if (inputData.keyCode === ROT.KEYS.VK_RIGHT || inputData.keyCode === ROT.KEYS.VK_D) {
                return new MoveAction(1, 0);
            } else if (inputData.keyCode === ROT.KEYS.VK_UP || inputData.keyCode === ROT.KEYS.VK_W) {
                return new MoveAction(0, -1);
            } else if (inputData.keyCode === ROT.KEYS.VK_DOWN || inputData.keyCode === ROT.KEYS.VK_S) {
                return new MoveAction(0, 1);
            }
        } 
        return new Action(); 
    }  
}