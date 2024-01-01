function getRandomColor() {
  const hue = Math.floor(Math.random() * 18) * 20;
  const saturation = 70;
  const lightness = 100;

  const color =  hsvToHex(hue, saturation, lightness);
  return color;
}

function hsvToHex(h, s, v) {
  function M(x){return Math.max(0,Math.min(360,x));}
  function R(x,y){return Math.round((x+y)*255).toString(16).padStart(2,"0");}
  h=M(h);s=M(s);v=M(v);
  let c=(v/100)*(s/100);let x=c*(1-Math.abs(((h/60)%2)-1));let m=(v/100)-c;
  let r,g,b;
  if(h>=0&&h<60){r=c;g=x;b=0;}
  else if(h>=60&&h<120){r=x;g=c;b=0;}
  else if(h>=120&&h<180){r=0;g=c;b=x;}
  else if(h>=180&&h<240){r=0;g=x;b=c;}
  else if(h>=240&&h<300){r=x;g=0;b=c;}
  else {r=c;g=0;b=x;}
  return `#${R(r,m)}${R(g,m)}${R(b,m)}`;
}

function hslToHex(h, s, l) {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

module.exports = { getRandomColor, hsvToHex, hslToHex };