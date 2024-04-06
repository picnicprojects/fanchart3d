// https://github.com/spite/ccapture.js
// https://raw.githubusercontent.com/spite/ccapture.js/master/build/CCapture.all.min.js

var three = THREE;
var scene = new three.Scene();
var camera = new three.PerspectiveCamera(10, window.innerWidth/window.innerHeight);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 15;

var renderer = new three.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
var maxgeneration = 0;
var fanchart = new THREE.Group();


var loader = new THREE.FontLoader();
loader.load( 'https://unpkg.com/three@0.77.0/examples/fonts/helvetiker_bold.typeface.json', function ( font ) {
   set_light()
   var maxdate  = -1e32;
   var mindate  = 1e32;
   
   write_segments()
   scene.add(fanchart);
   showgeneration = maxgeneration;
   // fanchart.rotation.y = Math.PI/4
   animate();
   // animate_mouse();

   function write_segments(){
      for (let i = 0; i < data.length; i++)
      {
         data[i].generation = parseInt(data[i].generation);
         data[i].segment = parseInt(data[i].segment);
         data[i].bd = Date.parse(data[i].birth_guess)
         data[i].dd = Date.parse(data[i].death_guess)
         data[i].age = (data[i].dd - data[i].bd) / (1000*60*60*24*365)
         maxgeneration = Math.max(data[i].generation, maxgeneration);
         mindate  = Math.min(data[i].bd, mindate);
         maxdate  = Math.max(data[i].dd, maxdate);
      }
      
      for (let i = 0; i < data.length; i++)
      {
         if (data[i].generation <= 6 )
         {
            r0 = (data[i].generation - 1)/ maxgeneration;
            r1 = (data[i].generation )/ maxgeneration;
            a0 =  data[i].segment    / Math.pow(2,data[i].generation-1)
            a1 = (data[i].segment+1) / Math.pow(2,data[i].generation-1)
            // console.log(data[i].generation,data[i].segment,a0,a1,data[i].segment+1, Math.pow(2,data[i].generation-1))
            
            z0 = (data[i].bd - mindate)/ (maxdate-mindate);
            z1 = (data[i].dd - mindate)/ (maxdate-mindate);
            create_segment_shape(r0, r1, 2*Math.PI*a0, 2*Math.PI*a1, z0, z1, data[i].gender, data[i].generation, data[i].segment, data[i].name);
         }   
      }
      // add timeline
      // const geometry = new THREE.CylinderGeometry( 0.01, 0.01, 2);
      // geometry.rotateX(Math.PI/2);
      // geometry.translate(0,-1.2,-1);
      // const material = new THREE.MeshPhongMaterial( { color: 0xff0000 } );
      // const line = new THREE.Mesh(geometry, material);
      // fanchart.add(line);
   }
   function create_segment_shape(r0, r1, a0, a1, z0, z1, gender, generation, segment, name){
      // console.log(r0, r1, a0, a1, z0, z1, gender, generation)
      // a0 = start angle
      // a1 = end angle
      // z0 = start in z (between 0 and 1)
      // z1 = end in z
      var segment2D = new three.Shape();
      if (r0 == 0){
         // circle for first person
         segment2D.moveTo( 0, r1 );
         segment2D.quadraticCurveTo( r1, r1, r1, 0 );
         segment2D.quadraticCurveTo( r1, -r1, 0, -r1 );
         segment2D.quadraticCurveTo( -r1, -r1, -r1, 0 );
         segment2D.quadraticCurveTo( -r1, r1, 0, r1 );
     }
      else{
         b0 = a0 + Math.PI/2
         b1 = a1 + Math.PI/2
         segment2D.absarc(0,0, r0, b0, b1, false);
         segment2D.lineTo(r1*Math.cos(b1), r1*Math.sin(b1));
         segment2D.absarc(0,0, r1, b1, b0, true);
         segment2D.lineTo(r0*Math.cos(b0), r0*Math.sin(b0));
      }
      
      z0 = -2*(1-z0);
      z1 = -2*(1-z1);
      
      var path = new three.LineCurve3(
          new three.Vector3(0, 0, z0),
          new three.Vector3(0, 0, z1)
          );

      const extrudeSettings = {
         steps: 100,
         depth: 100,
         extrudePath: path
      };
      var geometry = new three.ExtrudeGeometry(segment2D, extrudeSettings );

      var lum = -0.75*r1;
      if (gender == 'M'){
         c = ColorLuminance("#0000ff", lum);
         var phongMaterial = new THREE.MeshPhongMaterial({color: c});
      }
      else{
         c = ColorLuminance("#FE036A", lum);
         var phongMaterial = new THREE.MeshPhongMaterial({color: c});
      }
      var segment3D = new three.Mesh(geometry, phongMaterial);
      segment3D.generation = generation;

      fanchart.add(segment3D);
      
      var phongMaterial = new THREE.MeshPhongMaterial({color: "#ffffff"});
      if (r0 == 0){
         var x = 0
         var y = 0 
      } else {
         var a = (a0 + a1) / 2
         var r = (r0 + r1) / 2
         var x = r*Math.cos(a)
         var y = r*Math.sin(a)
      }
      
      // var geometry = write_text(x.toFixed(2) + "," + y.toFixed(2) + "," + (180*a0/Math.PI).toFixed(2) + "," + segment, x, y, 1.02*z1);
      var geometry = write_text( name, x, y, 0.99*z1);
      var txt = new three.Mesh(geometry, phongMaterial);
      txt.generation = generation;
      fanchart.add(txt);
   };
   function write_text(txt, x, y, z){
      txt.replace("/ /g","%20")
      var textGeo = new THREE.TextGeometry( txt, {
           font: font,
           size: 0.04, // font size
           height: 0.01, // how much extrusion (how thick / deep are the letters)
           curveSegments: 12,
           bevelThickness: 0,
           bevelSize: 0,
           bevelEnabled: false
      });
      textGeo.center();
      textGeo.computeBoundingBox();
      if (x == 0)
      {
         x = x + 0.5 * textGeo.boundingBox.max.x;  
      }
      else if (x > 0)
      {
         x = x + textGeo.boundingBox.max.x;  
      }
      else
      {
         x = x - textGeo.boundingBox.max.x;  
      }
      textGeo.translate(x,y,z);
      return(textGeo)
   }

   function set_light(){
      const ambientLight = new THREE.AmbientLight( 0xffffff );
      scene.add( ambientLight );

      // const light1 = new THREE.DirectionalLight( 0xffffff, 3 );
      // light1.position.set( 0, 200, 0 );
      // scene.add( light1 );

      // const light2 = new THREE.DirectionalLight( 0xffffff, 3 );
      // light2.position.set( 100, 200, 100 );
      // scene.add( light2 );

      // const light3 = new THREE.DirectionalLight( 0xffffff, 3 );
      // light3.position.set( - 100, - 200, - 100 );
      // scene.add( light3 );
      
      // const light1 = new THREE.DirectionalLight( 0xffffff, 1 );
      // light1.position.set( 0, 0, 10 );
      // scene.add( light1 );
      // const light2 = new THREE.DirectionalLight( 0xffffff, 1 );
      // light2.position.set( 10, 0, 10 );
      // scene.add( light2 );

      // const light3 = new THREE.DirectionalLight( 0xffffff, 1 );
      // light3.position.set( -10, 0, 10 );
      // scene.add( light3 );
   }
});


function ColorLuminance(hex, lum) {
   // lum [0,1]  lighter
   // lum [-1,0] darker
	var rgb = "#", c0,c1, i;
	for (i = 0; i < 3; i++) {
		c0 = parseInt(hex.substr(1+i*2,2), 16);
		c1 = Math.round(Math.min(Math.max(0, c0 + (c0 * lum)), 255)).toString(16);
		rgb += ("00"+c1).substr(c1.length);
	}
	return rgb;
}


function animate(){
    requestAnimationFrame( animate );
    fanchart.rotation.y += 0.01;
    renderer.render( scene, camera );
};
   
   // while(1){
      // var deltaRotationQuaternion = new three.Quaternion()
         // .setFromEuler(new three.Euler(0, .1, 0, 0, 'XYZ'));

      // fanchart.quaternion.multiplyQuaternions(deltaRotationQuaternion, fanchart.quaternion);
      
   // }
   // };


function animate_mouse(){
   // Try touchstart and touchend as the event listeners for touch screens.
   // window.addEventListener("touchstart", handleStart, false);
   // window.addEventListener("touchend", handleEnd, false);
   var isDragging = false;
   var previousMousePosition = {
       x: 0,
       y: 0
   };
   $(renderer.domElement).on('mousedown', function(e) {
       isDragging = true;
   })
   .on('mousemove', function(e) {
       var deltaMove = {
           x: e.offsetX-previousMousePosition.x,
           y: e.offsetY-previousMousePosition.y
       };
       if(isDragging) {
           var deltaRotationQuaternion = new three.Quaternion()
               .setFromEuler(new three.Euler(
                   toRadians(deltaMove.y * 1),
                   toRadians(deltaMove.x * 1),
                   0,
                   'XYZ'
               ));
           fanchart.quaternion.multiplyQuaternions(deltaRotationQuaternion, fanchart.quaternion);
       }
       previousMousePosition = {
           x: e.offsetX,
           y: e.offsetY
       };
   });

   $(document).on('keypress', function(e) {
      if (e.which == 43) // plus
      {
         if (showgeneration < maxgeneration)
         {
            showgeneration = showgeneration + 1;
         }
      }
     if (e.which == 45) // minus
     {
         if ((showgeneration) > 1)
         {
            showgeneration = showgeneration - 1;
         }
     }

      if ((e.which == 43) || (e.which == 45))
      {
         scene.traverse(function(obj){
            if(obj.type == 'Mesh'){
               if (parseInt(obj.generation) <= showgeneration)
               {
                  obj.visible = true;
               }
               else
               {
                  obj.visible = false;
               }
            }
         });
      }
   });


   $(document).on('mouseup', function(e) {
       isDragging = false;
   });

   // shim layer with setTimeout fallback
   window.requestAnimFrame = (function(){
       return  window.requestAnimationFrame ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame ||
           function(callback) {
               window.setTimeout(callback, 1000 / 60);
           };
   })();

   var lastFrameTime = new Date().getTime() / 1000;
   var totalGameTime = 0;
   render();
   update(0, totalGameTime);


   function update(dt, t) {
       //console.log(dt, t);
       
       //camera.position.z += 1 * dt;
       //cube.rotation.x += 1 * dt;
       //cube.rotation.y += 1 * dt;
       
       setTimeout(function() {
           var currTime = new Date().getTime() / 1000;
           var dt = currTime - (lastFrameTime || currTime);
           totalGameTime += dt;
           
           update(dt, totalGameTime);
       
           lastFrameTime = currTime;
       }, 0);
   }
}

function render() {
    renderer.render(scene, camera);
    requestAnimFrame(render);
}

function toRadians(angle) {
	return angle * (Math.PI / 180);
}

function toDegrees(angle) {
	return angle * (180 / Math.PI);
}

