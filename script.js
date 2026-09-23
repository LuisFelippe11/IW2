const API="https://pokeapi.co/api/v2";
const TCG="https://api.tcgdex.net/v2/en/cards";

const $=x=>document.getElementById(x);

const types={
normal:"#a8a77a",fire:"#ee8130",water:"#6390f0",
electric:"#f7d02c",grass:"#7ac74c",ice:"#96d9d6",
fighting:"#c22e28",poison:"#a33ea1",ground:"#e2bf65",
flying:"#a98ff3",psychic:"#f95587",bug:"#a6b91a",
rock:"#b6a136",ghost:"#735797",dragon:"#6f35fc",
dark:"#705746",steel:"#b7b7ce",fairy:"#d685ad"
};

let current=25;

const ids=[
"status","searchForm","searchInput","randomBtn","themeBtn",
"prevBtn","nextBtn","pDex","pGenus","pImg","pName",
"pIdSmall","pFlavor","pHeight","pWeight",
"pNameCenter","pIdCenter","pTypes","pSize",
"pOrigin","pGeneration","pColor","statsList",
"recordId","tcgCard","tcgMessage",
"tcgCardName","tcgCardId","typeLegend"
];

ids.forEach(i=>window[i]=$(i));


function format(n){
return String(n).padStart(3,"0");
}


function nameFormat(n){
return n.split("-").map(
x=>x[0].toUpperCase()+x.slice(1)
).join(" ");
}


async function pokemon(id){
let r=await fetch(`${API}/pokemon/${id}`);
if(!r.ok)throw 0;
return r.json();
}


async function species(id){
return fetch(`${API}/pokemon-species/${id}`)
.then(r=>r.json());
}


function setTheme(type){

let c=types[type]||"#ef5350";

let rgb=c.match(/\w\w/g)
.map(x=>parseInt(x,16))
.join(",");

document.documentElement.style
.setProperty("--accent",c);

document.documentElement.style
.setProperty("--rgb",rgb);

let d=rgb.split(",")
.map(x=>Math.floor(x*.45))
.join(",");

document.documentElement.style
.setProperty("--deep",`rgb(${d})`);
}



function renderTypes(data){

pTypes.innerHTML="";

data.forEach(x=>{

let e=document.createElement("span");

e.className="type";
e.textContent=x.type.name.toUpperCase();
e.style.background=types[x.type.name];

pTypes.appendChild(e);

});

}



function renderLegend(){

Object.entries(types).forEach(([n,c])=>{

let e=document.createElement("span");

e.textContent=n.toUpperCase();
e.style.color=c;
e.style.borderColor=c;

typeLegend.appendChild(e);

});

}



function stats(data){

statsList.innerHTML="";

data.forEach(x=>{

let row=document.createElement("div");

row.className="stat-row";

row.innerHTML=`

<span>${x.stat.name.toUpperCase()}</span>
<strong>${x.base_stat}</strong>
<div class="stat-bar">
<div class="stat-fill" style="width:${x.base_stat/1.5}%"></div>
</div>

`;

statsList.appendChild(row);

});

}



function flavor(s){

let x=s.flavor_text_entries.find(
e=>e.language.name=="en"
);

return x?
x.flavor_text.replace(/[\n\f]/g," "):
"Descrição não encontrada.";

}



async function loadCard(name){

tcgCard.removeAttribute("src");
tcgMessage.style.display="block";
tcgMessage.textContent="BUSCANDO CARTA...";


try{

let r=await fetch(`${TCG}?name=${name}`);

let cards=await r.json();

if(!cards.length)throw 0;


let card=cards.find(
c=>c.name.toLowerCase()==name.toLowerCase()
)||cards[0];


if(!card.image)throw 0;


tcgCard.src=`${card.image}/high.png`;

tcgCardName.textContent=card.name;
tcgCardId.textContent=card.id;

tcgMessage.style.display="none";


}catch{

tcgMessage.textContent="CARTA NÃO ENCONTRADA";

tcgCardName.textContent="SEM CARTA";
tcgCardId.textContent="---";

}

}





async function load(id){

try{

status.textContent="Carregando...";

let p=await pokemon(id);
let s=await species(p.id);

current=p.id;


let n=nameFormat(p.name);
let num=format(p.id);


pDex.textContent="#"+num;
recordId.textContent="#"+num;

pIdSmall.textContent="ID "+num;
pIdCenter.textContent="#"+num;


pName.textContent=n.toUpperCase();
pNameCenter.textContent=n.toUpperCase();


pGenus.textContent=
s.genera.find(
x=>x.language.name=="en"
)?.genus||"SPECIES";


pHeight.textContent=p.height/10+" m";
pWeight.textContent=p.weight/10+" kg";

pSize.textContent=
`${p.height/10}m / ${p.weight/10}kg`;


pFlavor.textContent=flavor(s);


pOrigin.textContent=
s.generation.name
.replace("generation-","")
.toUpperCase();


pGeneration.textContent=
s.generation.name
.replace("generation-","GEN ");


pColor.textContent=
s.color.name.toUpperCase();



pImg.src=
p.sprites.other["official-artwork"]
.front_default;


renderTypes(p.types);

stats(p.stats);


setTheme(
p.types[0].type.name
);


status.textContent=
`${n} carregado • #${num}`;


await loadCard(p.name);


}catch{

status.textContent="Pokémon não encontrado";

}

}




searchForm.onsubmit=e=>{

e.preventDefault();

let value=searchInput.value.trim();

if(value){

load(value);

searchInput.value="";

}

};



randomBtn.onclick=()=>{

load(
Math.floor(Math.random()*1025)+1
);

searchInput.value="";

};



nextBtn.onclick=()=>{

load(current+1);

};



prevBtn.onclick=()=>{

if(current>1)
load(current-1);

};



themeBtn.onclick=()=>{

document.body.classList.toggle(
"light-mode"
);

};



tcgCard.onerror=()=>{

tcgCard.removeAttribute("src");

tcgMessage.style.display="block";

tcgMessage.textContent=
"IMAGEM INDISPONÍVEL";

};



renderLegend();

load(current);