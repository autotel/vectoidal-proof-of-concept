import WaveCircle from "./WaveCircle";
import PlayWave from "./PlayWave";
import DisplayWave from "./DisplayWave";
import $ from "jquery";

const wave=new WaveCircle();
const player=new PlayWave(wave);
const display=new DisplayWave(wave,player);

display.appendTo($("body"));