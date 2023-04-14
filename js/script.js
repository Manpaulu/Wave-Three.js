let renderer, camera, scene;
let controls;
let planeGeo;
const segmentsX = 30;
const segmentsZ = 60;

const totalSegmentsX = segmentsX + 1; 
const totalSegmentsZ = segmentsZ + 1;

let count;
let compteur;
let t, teta;
let BPM = 163;
let amplitude = 0; 
let alpha = 0;
let beta = 0;
let spheres = [];

let randomsZ = [];
let randomsX = [];

let ellapsedTime;

let spherePosx, spherePosy, spherePosz;
let idx;

const playButton = document.getElementById("button");


function play() {
    init(); 
    updatePlane();
    render();
    playButton.remove();
    }

function init(){
    //Create audio context 
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();

    //Create audio source node 
    let audio = new Audio();
    audio.preload = "auto";
    audio.src = "./audio/waves.mp3";
    audio.play();
    let audioSourceNode = audioContext.createMediaElementSource(audio);

    //Create audio analyser
    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 256;
    dataArray = new Uint8Array(analyserNode.frequencyBinCount);

    //Connext analyser and audio source 
    audioSourceNode.connect(analyserNode);
    analyserNode.connect(audioContext.destination);
    
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
        45, 
        1600 / 1200,
        0.1, 
        1000);
    // camera.position.set(0, 0, 40);
    
    camera.lookAt(scene.position);
    scene.add(camera);
    const brown = new THREE.Color(0x0d0c0b);
    scene.background = brown; 

    background = "#01191f";
    background2="#0f0e0d";
    scene.fog = new THREE.Fog(background2, 150, 500);

    planeGeo = new THREE.PlaneGeometry(520, 2000, segmentsX, segmentsZ);

	var plane = new THREE.Mesh(planeGeo, new THREE.MeshBasicMaterial({
		color: 0x5b6f7a,
		wireframe: true,
        // vertexColors : true
       
	}))

    scene.add(plane);

    renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('canvas.webgl'),
        antialias: true
    });

    const canvas = renderer.domElement;
  // look up the size the canvas is being displayed
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    renderer.setSize(width, height);

    controls = new function(){
        this.cameraX =0;
        this.cameraY = 15;
        this.cameraZ = 1500;
        this.cameraRX = 0;
        this.cameraRY = 15;
        this.cameraRZ = 1000;
        };

    camera.position.set(controls.cameraX, controls.cameraY, controls.cameraZ);

    // let gui = new dat.GUI();
    // gui.add(controls, 'cameraX', -100, 100);
    // gui.add(controls, 'cameraY', -100, 100);
    // gui.add(controls, 'cameraZ', -100, 1000);
    // gui.add(controls, 'cameraRX', -100, 100);
    // gui.add(controls, 'cameraRY', -100, 100);
    // gui.add(controls, 'cameraRZ', -100, 1000);

    plane.rotation.x -= Math.PI * .5;

   count = planeGeo.attributes.position.count;

   //création des notes
        let declageSphere = 41; // déclage entre les spheres pour mimer les notes.
        for(l=0; l<7; l++) {
            for(i=0; i<5; i++) {
            let idx = l * 5 + i;
            spherePosy = 245 +  (i*declageSphere);
            randomsZ.push( Math.floor(Math.random() * (-175 - (-375)) ) + (-375));
            randomsX.push(Math.random() * (185 -(-185)) + (-185));
            const geometry = new THREE.SphereGeometry( 2, 32, 16 );
            const material = new THREE.MeshBasicMaterial( { color: 0xe1f9f4, wireframe: true} );
            spheres.push(new THREE.Mesh(geometry, material));
            scene.add(spheres[idx]);
            spheres[idx].position.set(randomsX[idx], spherePosy, randomsZ[idx]);
            spheres[idx].visible = false;
        }
        }


    startTime = new Date().getTime();

}

function updatePlane(){

    for(let z = 0; z < totalSegmentsZ; z++) {
        for(let x = 0; x < totalSegmentsX; x++) {
            index = z * totalSegmentsX + x;

            //attribuer une position aléatoire pour z
            planeGeo.attributes.position.setZ(index, Math.random()*4);
        }
    }
      //to make sure our changes to the buffer attribute is taken into account
    planeGeo.attributes.position.needsUpdate = true; 
    planeGeo.computeVertexNormals();  
}; 


function render() {

    renderer.render(scene, camera);
    
    let nowTime = new Date().getTime();
    t = (nowTime - startTime) / 1000;
    teta = t * Math.PI * BPM / 30 ; //

    // analyserNode.getByteFrequencyData(dataArray);
    // console.log(dataArray);

    // camera.position.set(controls.cameraX, controls.cameraY, controls.cameraZ);
    // camera.rotation.set(controls.cameraRX, controls.cameraRY, controls.cameraRZ);

    //WAVE
    for (let z = 0; z < totalSegmentsX*totalSegmentsZ; z++) {

        // amplitude = 0.05; //amplitude de la courbe
        let diviseur = 15;
        posZ = planeGeo.attributes.position.getZ(z);
        
        posX = planeGeo.attributes.position.getX(z);
        newPosZ = posZ + (amplitude * Math.sin((posX + teta)/diviseur));
        // console.log(newPosZ);
        planeGeo.attributes.position.setZ(z, newPosZ);
        planeGeo.attributes.position.needsUpdate = true;
        // compteur += 0.000020 //temps pour ralentire la coubre
        
    }
    
    ellapsedTime = nowTime - startTime;    
    // console.log(ellapsedTime);

    if (ellapsedTime>=0 && ellapsedTime < 57500) {
        alpha += 0.00001;
        camera.position.lerp(new THREE.Vector3(0, 15, 100), alpha);
        if (amplitude < 0.1) {
            amplitude += 0.00008;
        }
       
    }
    
    if(ellapsedTime>=37000 && ellapsedTime<42000) // la bonne heure c'est 37000
    {
        // c'est vraiment pas  bon, mais j'essaye de faire 7 groupe de 5 spheres. il  y aurait un petit décalage entre chaque groupe (de 3 secondes). J'ai pas encore trouvé comment faire.
        for(i=0; i<5; i++) {
            spheres[i].visible = true;
            spheres[i].position.y -= 2;
            if (spheres[i].position.y < -5) scene.remove(spheres[i]);
        }
    }
    
    if(ellapsedTime>=40000 && ellapsedTime<59000) // la bonne heure c'est 37000
    {
        
        for(i=0; i<5; i++) {
            
            spheres[i+5].visible = true;
                spheres[i+5].position.y -= 2;
                if (spheres[i+5].position.y < -5) scene.remove(spheres[i+5]);
            }
        }
        
    if(ellapsedTime>=43000 && ellapsedTime<59000) // la bonne heure c'est 37000
    {
        
        for(i=0; i<5; i++) {
            
            spheres[i+10].visible = true;
            spheres[i+10].position.y -= 2;
            if(spheres[i+10].position.y < -5) scene.remove(spheres[i+10]);
        }
    }
    if(ellapsedTime>=46000 && ellapsedTime<59000) // la bonne heure c'est 37000
    {
        
        for(i=0; i<5; i++) {
            
            spheres[i+15].visible = true;
            spheres[i+15].position.y -= 2;
            if (spheres[i+15].position.y < -5) scene.remove(spheres[i+15]);
        }
    }
    
    if(ellapsedTime>=49000 && ellapsedTime<59000) // la bonne heure c'est 37000
    {
        
        for(i=0; i<5; i++) {
            
            spheres[i+20].visible = true;
            spheres[i+20].position.y -= 2;
            if (spheres[i+20].position.y < -5) scene.remove(spheres[i+20]);
        }
    }
    if(ellapsedTime>=52000 && ellapsedTime<59000) // la bonne heure c'est 37000
    {
        
        for(i=0; i<5; i++) {
            
            spheres[i+25].visible = true;
            spheres[i+25].position.y -= 2;
            if (spheres[i+25].position.y < -5) scene.remove(spheres[i+25]);
        }
    }
    if(ellapsedTime>=55000 && ellapsedTime<60000) // la bonne heure c'est 37000
    {
        
        for(i=0; i<5; i++) {
            
            spheres[i+30].visible = true;
            spheres[i+30].position.y -= 2;
            if (spheres[i+30].position.y < -5) scene.remove(spheres[i+30]);
        }
    }
    
    if(ellapsedTime>=57500 && ellapsedTime < 62000) {
        amplitude = 0.1;
        // beta += 0.0001;
        // camera.position.lerp(new THREE.Vector3(0, 100, 100), beta);
    }
    
    if(ellapsedTime>= 70000 && ellapsedTime < 75000) {
        
        if (camera.rotation.y < 3.1) {
            amplitude = 0.15;
            camera.rotation.y += 0.00005;
        }
        
    }
    if(ellapsedTime>= 70000 && ellapsedTime < 160000) {
        
        if (camera.rotation.y < 3.1) {
            camera.rotation.y += 0.00075;
        }
        
    }
    
    if(ellapsedTime>=82000 && ellapsedTime < 154000) {
        amplitude = 0.7;
        scene.fog = new THREE.Fog(background2, 525, 700);
    }
    if (ellapsedTime >= 154000 && ellapsedTime < 165000 ) {

        amplitude -= 0.00001;
    }

    if (ellapsedTime>= 165000 && ellapsedTime < 165500) {
        amplitude = 0.001;
    }

    if (ellapsedTime >= 165500 && ellapsedTime < 239000) {
        amplitude = amplitude > 0.05 ? 0.05 : amplitude += 0.0008;
        beta += 0.000005;
        camera.position.lerp(new THREE.Vector3(20, 15, -1600), beta);
    }

    if (ellapsedTime >= 239000) {
        if (amplitude > 0){
            amplitude -= 0.0001;
        }
    }
        
        
        requestAnimationFrame(render);
        
    }
    
    
    
    
    
