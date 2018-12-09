/**
* Patrick Sacchet
* Wed Nov 28, 2018 - Ver. 1.0
*
* Sources:
* https://threejs.org/docs/#api/en/core/Object3D
* https://threejs.org/docs/#api/en/objects/Mesh
* https://threejs.org/docs/#api/en/core/Geometry
* https://threejs.org/docs/#api/en/math/Vector3
* https://threejs.org/docs/#api/en/core/Clock
**/

//Create renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor('black');
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// create scene
var scene = new THREE.Scene();

//Create camera
var aspect = window.innerWidth/window.innerHeight;
var camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
camera.position.set(0, 0, 175.0);

//Create lights
var light_ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(light_ambient);
var light_point = new THREE.PointLight();
light_point.position.set(camera.position.x, camera.position.y, camera.position.z);
scene.add(light_point);

//****************************************************************************//
//Creating borders
var rect2geometry = new THREE.PlaneGeometry(2, 150);
var rect2material = new THREE.MeshBasicMaterial({color: 0x1919A6});
var wall1 = new THREE.Mesh(rect2geometry, rect2material);
scene.add(wall1);
wall1.position.x = -162;
wall1.width = 2;
wall1.height = 150;

var rect3geometry = new THREE.PlaneGeometry(2, 150);
var rect3material = new THREE.MeshBasicMaterial({color: 0x1919A6});
var wall2 = new THREE.Mesh(rect3geometry, rect3material);
scene.add(wall2);
wall2.position.x = 162;
wall2.width = 2;
wall2.height = 150;

var rect4geometry = new THREE.PlaneGeometry(400, 2);
var rect4material = new THREE.MeshBasicMaterial({color: 0x1919A6});
var wall3 = new THREE.Mesh(rect4geometry, rect4material);
scene.add(wall3);
wall3.position.y = 72;
wall3.width = 400;
wall3.height = 2;

var rect5geometry = new THREE.PlaneGeometry(400, 2);
var rect5material = new THREE.MeshBasicMaterial({color: 0x1919A6, wireframe: true});
var wall4 = new THREE.Mesh(rect4geometry, rect4material);
scene.add(wall4);
wall4.position.y = -72;
wall4.width = 400;
wall4.height = 2;
//****************************************************************************//
// Creating PacMan Circle
var geometry = new THREE.CircleGeometry(2,32);
var material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
var pacman = new THREE.Mesh( geometry, material );
scene.add(pacman);
pacman.position.y = 1;
pacman.position.x = -12;
//****************************************************************************//
//Adding the intro song
var listener = new THREE.AudioListener();
camera.add(listener);
var sound = new THREE.Audio(listener);
var audioLoader = new THREE.AudioLoader();
audioLoader.load('/threejs/pac-man-intro.mp3', function(buffer) {
    sound.setBuffer( buffer );
    sound.setLoop(false);
    sound.setVolume(0.5);
    sound.play();
});



// Creating keyboard variable which will be used for input
var keyboard = new THREEx.KeyboardState();

//Something to keep track of Score
var score = 0;

var pacDead;

//Something to keep the user from smashing input
var dt = 0;
var dg = 0;

//Number of lives for user
var lives = 2;

//Adding barriers to map
makeBarriers(10, 1);

//Adding pills to map
addPills(1);

// gui
//var gui = new dat.GUI();
//gui.width = 400;
//h = gui.addFolder("Score");
//h.open();
//h.add(score, "score").name("Score");


//Adding ghosts to the map
var ghost1geometry = new THREE.PlaneGeometry(2.5, 5);
var ghost1material = new THREE.MeshBasicMaterial({color: 0xFF0000});
var ghost1 = new THREE.Mesh(ghost1geometry, ghost1material);
scene.add(ghost1);
ghost1.position.x = -132;
ghost1.position.y = -1;
ghost1.width = 2.5;
ghost1.height = 5;

var ghost2geometry = new THREE.PlaneGeometry(2.5, 5);
var ghost2material = new THREE.MeshBasicMaterial({color: 0xFFB8FF});
var ghost2 = new THREE.Mesh(ghost2geometry, ghost2material);
scene.add(ghost2);
ghost2.position.x = 132;
ghost2.position.y = -1;
ghost2.width = 2.5;
ghost2.height = 5;

var ghost3geometry = new THREE.PlaneGeometry(2.5, 5);
var ghost3material = new THREE.MeshBasicMaterial({color: 0x00FFFF});
var ghost3 = new THREE.Mesh(ghost3geometry, ghost3material);
scene.add(ghost3);
ghost3.position.x = -12;
ghost3.position.y = 60;
ghost3.width = 2.5;
ghost3.height = 5;

var ghost4geometry = new THREE.PlaneGeometry(2.5, 5);
var ghost4material = new THREE.MeshBasicMaterial({color: 0xFFB852});
var ghost4 = new THREE.Mesh(ghost4geometry, ghost4material);
scene.add(ghost4);
ghost4.position.x = -12;
ghost4.position.y = -60;
ghost4.width = 2.5;
ghost4.height = 5;

//Pause user interaction while song plays
var played = false;


// create animation clock and start animation
var clock = new THREE.Clock();
animate();

// -----------------------------------------------------------------------------
function animate() {

    //Put this function in queue for another frame after this one
    requestAnimationFrame(animate);

    //Get delta time: seconds passed since last frame, add overtime until time has reahced 0.09 seconds
    var t = clock.getDelta();
    dt = dt + t;
    dg = dg + t;

    //This large if statement prevents the user from hitting the keys too fast, causing any clipping errors
    // and allowing the "waka waka" sound effect to not overlap
    if(dt > 0.25)
    {

    //Checking for keyboard input, if user presses w we move pacman up one
    if(keyboard.pressed("W"))
    {
      pacman.position.y = pacman.position.y + 1;
      camera.position = pacman.position;
      var listener = new THREE.AudioListener();
      camera.add(listener);
      var sound = new THREE.Audio(listener);
      var audioLoader = new THREE.AudioLoader();
      audioLoader.load('/threejs/waka.mp3', function(buffer) {
          sound.setBuffer( buffer );
          sound.setLoop(false);
          sound.setVolume(0.5);
          sound.play();
      });
      dt = 0;
      //Traversing the scene, analyzing the relevant object and checking to see if it collides
      scene.traverse( function( node )
      {
        //Setting x min and x max values to ensure pacman is infront of the barrier
        var maxleft = (node.position.x - (node.width/2));
        var maxright = (node.width/2) + node.position.x;
        var maxdown = (node.position.y - (node.height/2));
        //This excludes the outer boundaries of the map
        if (node instanceof THREE.Mesh && node.height < 150 && node.width < 150 && node.width != 2.5)
        {
          //If pacman is colliding with the barrier, and is in front of the barrier
          if((((pacman.position.y + 2)  - node.position.y  == 0) && (pacman.position.x >= maxleft && pacman.position.x <= maxright ))
        || (((pacman.position.y + 2) - maxdown == 0)) && (pacman.position.x >= maxleft && pacman.position.x <= maxright))
          {
            //Move pacman back to original spot
            pacman.position.y = pacman.position.y - 1;
            renderer.render(scene, camera);
          }
        }
        //If the barrier is large, then it is an outer barrier
        else if(node instanceof THREE.Mesh && node.width >= 150)
        {
          //Checking for the collision
          if((pacman.position.y + 2)  - node.position.y  == 0)
          {
            //Move pacman back into place
            pacman.position.y = pacman.position.y - 1;
            renderer.render(scene, camera);
          }
        }
        //Checking to see if it is a pill object
        else if(node instanceof THREE.Mesh && node.height == 0)
        {
          //Checking for collision
          if(((pacman.position.x  - node.position.x  == 0) && (pacman.position.y - node.position.y == 0)) ||
           (((pacman.position.x + 2)  - node.position.x  == 0) && (pacman.position.y )- node.position.y == 0) ||
            ((pacman.position.x   - node.position.x  == 0) && ((pacman.position.y + 2 )- node.position.y == 0))||
             (((pacman.position.x - 2)  - node.position.x  == 0) && (pacman.position.y - node.position.y == 0))||
              ((pacman.position.x   - node.position.x  == 0) && ((pacman.position.y - 2 )- node.position.y == 0)))
          {
            //Removing the pill object, adding to score
            scene.remove(node);
            score = score + 10;
            renderer.render(scene, camera);
          }
        }
      });
    }

    //Checking for keyboard input, if user presses s we move pacman down one
    else if(keyboard.pressed("S"))
    {
      pacman.position.y = pacman.position.y - 1;
      camera.position = pacman.position;
      dt = 0;
      var listener = new THREE.AudioListener();
      camera.add(listener);
      var sound = new THREE.Audio(listener);
      var audioLoader = new THREE.AudioLoader();
      audioLoader.load('/threejs/waka.mp3', function(buffer) {
          sound.setBuffer( buffer );
          sound.setLoop(false);
          sound.setVolume(0.5);
          sound.play();
      });
      //Traversing entire scene, only picking relevant objects
      scene.traverse( function( node )
      {
        //Getting maximum left and right x values of the object
        var maxleft = (node.position.x - (node.width/2));
        var maxright = (node.width/2) + node.position.x;
        var maxup = (node.height/2) + node.position.y;
        //Checking to see if it is a barrier inside the map
        if (node instanceof THREE.Mesh && node.height < 150 && node.width < 150 && node.width != 2.5)
        {
          //Checking for collision and to see if pacman is in front of the barrier
          if(((pacman.position.y - 2) - node.position.y == 0) && (pacman.position.x >= maxleft && pacman.position.x <= maxright )
        || (((pacman.position.y - 2) - maxup == 0)) && (pacman.position.x >= maxleft && pacman.position.x <= maxright))
          {
            //Placing pacman back into original position
            pacman.position.y = pacman.position.y + 1;
            renderer.render(scene, camera);
          }
        }
        //Checking to see if the barrier is a outer boundary
        else if(node instanceof THREE.Mesh && node.width >= 150)
        {
          //Checking for collision
          if((pacman.position.y - 2)  - node.position.y  == 0)
          {
            //Place pacman back into original spot
            pacman.position.y = pacman.position.y + 1;
            renderer.render(scene, camera);
          }
        }
        //Checking to see if it is a pill object
        else if(node instanceof THREE.Mesh && node.height == 0)
        {
          //Checking for collision
          if(((pacman.position.x  - node.position.x  == 0) && (pacman.position.y - node.position.y == 0)) ||
           (((pacman.position.x + 2)  - node.position.x  == 0) && (pacman.position.y )- node.position.y == 0) ||
            ((pacman.position.x   - node.position.x  == 0) && ((pacman.position.y + 2 )- node.position.y == 0))||
             (((pacman.position.x - 2)  - node.position.x  == 0) && (pacman.position.y - node.position.y == 0))||
              ((pacman.position.x   - node.position.x  == 0) && ((pacman.position.y - 2 )- node.position.y == 0)))
          {
            //Removing pill object and updating score
            scene.remove(node);
            score = score + 10;
            renderer.render(scene, camera);
          }
        }
      } );
    }

    //Checking for keyboard input, if user presses d we move pacman right one
    else if(keyboard.pressed("D"))
    {
      pacman.position.x = pacman.position.x + 1;
      camera.position = pacman.position;
      dt = 0;
      var listener = new THREE.AudioListener();
      camera.add(listener);
      var sound = new THREE.Audio(listener);
      var audioLoader = new THREE.AudioLoader();
      audioLoader.load('/threejs/waka.mp3', function(buffer) {
          sound.setBuffer( buffer );
          sound.setLoop(false);
          sound.setVolume(0.5);
          sound.play();
      });
      //Traversing entire scene and only picking relevant objects
      scene.traverse( function( node )
      {
        //Finding the max and min y values to ensure pacman is in front of the barrier
        var maxdown = (node.position.y - (node.height/2));
        var maxup = (node.height/2) + node.position.y;
        var maxleft = (node.position.x - (node.width/2));
        //Checking to see if it is a barrier inside map
        if (node instanceof THREE.Mesh && node.height < 150 && node.width < 150 && node.width != 2.5)
        {
          //Checking for collision and to see if pacman is in front of the barrier
          if(((pacman.position.x + 2 ) - node.position.x == 0) && (pacman.position.y >= maxdown && pacman.position.y <= maxup )
        || (((pacman.position.x + 2) - maxleft == 0)) && (pacman.position.y >= maxdown && pacman.position.y <= maxup))
          {
            //Placing pacman back into place
            pacman.position.x = pacman.position.x - 1 ;
            renderer.render(scene, camera);
          }
        }
        //Checking to see if it is an outer boundary
        else if(node instanceof THREE.Mesh && node.height >= 150)
        {
          //Checking for collision
          if((pacman.position.x + 2)  - node.position.x  == 0)
          {
            //Placing pacman back into place
            pacman.position.x = pacman.position.x - 1;
            renderer.render(scene, camera);
          }
        }
        //Checking to see if it is a pill object
        else if(node instanceof THREE.Mesh && node.height == 0)
        {
          //Checking for collision
          if(((pacman.position.x  - node.position.x  == 0) && (pacman.position.y - node.position.y == 0)) ||
           (((pacman.position.x + 2)  - node.position.x  == 0) && (pacman.position.y )- node.position.y == 0) ||
            ((pacman.position.x   - node.position.x  == 0) && ((pacman.position.y + 2 )- node.position.y == 0))||
             (((pacman.position.x - 2)  - node.position.x  == 0) && (pacman.position.y - node.position.y == 0))||
              ((pacman.position.x   - node.position.x  == 0) && ((pacman.position.y - 2 )- node.position.y == 0)))
          {
            //Removing pill object and updating score
            scene.remove(node);
            score = score + 10;
            renderer.render(scene, camera);
          }
        }
      } );
    }

    //Checking for keyboard input, if user presses a we move pacman left one
    else if(keyboard.pressed("A"))
    {
      pacman.position.x = pacman.position.x - 1;
      camera.position = pacman.position;
      dt = 0;
      var listener = new THREE.AudioListener();
      camera.add(listener);
      var sound = new THREE.Audio(listener);
      var audioLoader = new THREE.AudioLoader();
      audioLoader.load('/threejs/waka.mp3', function(buffer) {
          sound.setBuffer( buffer );
          sound.setLoop(false);
          sound.setVolume(0.5);
          sound.play();
      });
      //Traversing entire scene, selecting appropiate barriers
      scene.traverse( function( node )
      {
        //Finding the max and min y values of the barrier
        var maxdown = (node.position.y - (node.height/2));
        var maxup = (node.height/2) + node.position.y;
        var maxright = (node.width/2) + node.position.x;
        //Checking to see if the barrier is inside the boundary
        if (node instanceof THREE.Mesh && node.height < 150 && node.width < 150 && node.width != 2.5)
        {
          //Checking for collision and to see if pacman is in front of the barrier
          if(((pacman.position.x - 2) - node.position.x == 0)&& (pacman.position.y >= maxdown && pacman.position.y <= maxup )
        || (((pacman.position.x - 2) - maxright == 0)) && (pacman.position.y >= maxdown && pacman.position.y <= maxup))
          {
            //Placing pacman back in original spot
            pacman.position.x = pacman.position.x + 1 ;
            renderer.render(scene, camera);
          }
        }
        //Checking to see if it is an outer boundary
        else if(node instanceof THREE.Mesh && node.height >= 150)
        {
          //Checking for collision
          if((pacman.position.x - 2)  - node.position.x  == 0)
          {
            //Placing pacman back into original spot
            pacman.position.x = pacman.position.x + 1;
            renderer.render(scene, camera);
          }
        }
        //Checking to see if it is a pill object
        else if(node instanceof THREE.Mesh && node.height == 0)
        {
          //Checking for collision in every direction
          if(((pacman.position.x  - node.position.x  == 0) && (pacman.position.y - node.position.y == 0)) ||
           (((pacman.position.x + 2)  - node.position.x  == 0) && (pacman.position.y )- node.position.y == 0) ||
            ((pacman.position.x   - node.position.x  == 0) && ((pacman.position.y + 2 )- node.position.y == 0))||
             (((pacman.position.x - 2)  - node.position.x  == 0) && (pacman.position.y - node.position.y == 0))||
              ((pacman.position.x   - node.position.x  == 0) && ((pacman.position.y - 2 )- node.position.y == 0)))
          {
            //Removing pill object and updating score
            scene.remove(node);
            score = score + 10;
            renderer.render(scene, camera);
          }
        }
      } );
    }
}
    if(dg > 0.5)
    {
      moveGhosts(ghost1, ghost2, ghost3, ghost4);
      dg = 0;
    }

    if((isPacmanDead(ghost1, pacman)) || (isPacmanDead(ghost2, pacman)) || (isPacmanDead(ghost3, pacman))
    || (isPacmanDead(ghost4, pacman)))
    {
      //var listener = new THREE.AudioListener();
      //camera.add(listener);
      //var sound = new THREE.Audio(listener);
      //var audioLoader = new THREE.AudioLoader();
      audioLoader.load('/threejs/pacman_death.wav', function(buffer) {
          sound.setBuffer( buffer );
          sound.setLoop(false);
          sound.setVolume(0.5);
          sound.play();
      });
      scene.remove(pacman);
      wait(3000);
      if (lives > 0)
      {
        scene.add(pacman);
        pacman.position.y = 1;
        pacman.position.x = -12;
        lives = lives -1;
      }
      else
      {
        alert("Sorry! You lose");
        alert("Your Score: " + score);
      }
    }

    //Update
    light_point.position.set(camera.position.x, camera.position.y, camera.position.z);

    //Render
    renderer.render(scene, camera);


}
// -----------------------------------------------------------------------------
function makeBarriers(width, height)
{
  var rectgeometry = new THREE.PlaneGeometry(width, height);
  var rectmaterial = new THREE.MeshBasicMaterial({color: 0x1919A6, wireframe: true});
  var maxx = 162;
  var maxy = 72;
  for(var x = -maxx; x <= maxx; x += 20)
  {
    for (var y = -maxy; y <= maxy; y += 20)
    {
      var barrier = new THREE.Mesh(rectgeometry, rectmaterial);
      scene.add(barrier);
      barrier.position.x = x;
      barrier.position.y = y;
      barrier.width = width;
      barrier.height = height;
    }
  }
  var rectgeometry1 = new THREE.PlaneGeometry(height, width);
  var rectmaterial1 = new THREE.MeshBasicMaterial({color: 0x1919A6, wireframe: true});
  for(var x = -maxx; x <= maxx; x += 30)
  {
    for (var y = -maxy; y <= maxy; y += 30)
    {
      var barrier = new THREE.Mesh(rectgeometry1, rectmaterial1);
      scene.add(barrier);
      barrier.position.x = x;
      barrier.position.y = y;
      barrier.width = height;
      barrier.height = width;
    }
  }
}

// -----------------------------------------------------------------------------
function addPills(radius)
{
  var pillgeo = new THREE.CircleGeometry(radius);
  var pillmat = new THREE.MeshBasicMaterial( { color: 0xffffff } );

  minx = -151;
  miny = -61;
  maxx = 148;
  maxy = 59;
  for (var x = minx; x <=maxx; x += 30)
  {
    var pill = new THREE.Mesh( pillgeo, pillmat );
    scene.add(pill);
    pill.position.x = (x);
    pill.position.y = (y);
    pill.height = 0;
    for(var y = miny; y <= maxy; y += 20)
    {
      var pill = new THREE.Mesh( pillgeo, pillmat );
      scene.add(pill);
      pill.position.x = (x);
      pill.position.y = (y);
      pill.height = 0;
    }
  }
}
// -----------------------------------------------------------------------------
function moveGhosts(ghost1, ghost2, ghost3, ground4)
{

  var randxgh1 = Math.floor((Math.random() * (2-(-1)) -1));
  var randygh1 = Math.floor((Math.random() * (2-(-1)) -1));
  ghost1.position.x = ghost1.position.x + randxgh1 ;
  checkGhostCollision(ghost1, randxgh1, randygh1);
  ghost1.position.y = ghost1.position.y + randygh1;
  checkGhostCollision(ghost1, randxgh1, randygh2);
  var randxgh2 = Math.floor((Math.random() * (2-(-1)) -1));
  var randygh2 = Math.floor((Math.random() * (2-(-1)) -1));
  ghost2.position.x = ghost2.position.x + randxgh2;
  checkGhostCollision(ghost2, randxgh2, randygh2);
  ghost2.position.y = ghost2.position.y + randygh2;
  checkGhostCollision(ghost2, randxgh2, randygh2);
  var randxgh3 = Math.floor((Math.random() * (2-(-1)) -1));
  var randygh3 = Math.floor((Math.random() * (2-(-1)) -1));
  ghost3.position.x = ghost3.position.x + randxgh3;
  checkGhostCollision(ghost3, randxgh3, randygh3);
  ghost3.position.y = ghost3.position.y + randygh3;
  checkGhostCollision(ghost3, randxgh3, randygh3);
  var randxgh4 = Math.floor((Math.random() * (2-(-1)) -1));
  var randygh4 = Math.floor((Math.random() * (2-(-1)) -1));
  ghost4.position.x = ghost4.position.x + randxgh4;
  checkGhostCollision(ghost4, randxgh4, randygh4);
  ghost4.position.y = ghost4.position.y + randygh4;
  checkGhostCollision(ghost4, randxgh4, randygh4);
}

// -----------------------------------------------------------------------------
function checkGhostCollision(ghost, xchange, ychange)
{
  if (xchange > 0)
  {
    scene.traverse( function( node )
    {
      //Finding the max and min y values to ensure pacman is in front of the barrier
      var maxdown = (node.position.y - (node.height/2));
      var maxup = (node.height/2) + node.position.y;
      //Checking to see if it is a barrier inside map
      if (node instanceof THREE.Mesh && node.height < 150 && node.width < 150)
      {
        //Checking for collision and to see if pacman is in front of the barrier
        if(((ghost.position.x + 3 ) - node.position.x == 0) && (ghost.position.y >= maxdown && ghost.position.y <= maxup ))
        {
          //Placing ghost back into place
          ghost.position.x = ghost.position.x - 1 ;
        }
      }
      //Checking to see if it is an outer boundary
      else if(node instanceof THREE.Mesh && node.height >= 150)
      {
        //Checking for collision
        if((ghost.position.x + 3)  - node.position.x  == 0)
        {
          //Placing pacman back into place
          ghost.position.x = ghost.position.x - 1;
        }
      }
    } );
  }

  if (xchange < 0)
  {
    scene.traverse( function( node )
    {
      //Finding the max and min y values to ensure pacman is in front of the barrier
      var maxdown = (node.position.y - (node.height/2));
      var maxup = (node.height/2) + node.position.y;
      //Checking to see if it is a barrier inside map
      if (node instanceof THREE.Mesh && node.height < 150 && node.width < 150)
      {
        //Checking for collision and to see if pacman is in front of the barrier
        if(((ghost.position.x - 3 ) - node.position.x == 0) && (ghost.position.y >= maxdown && ghost.position.y <= maxup ))
        {
          //Placing ghost back into place
          ghost.position.x = ghost.position.x + 1 ;
          //renderer.render(scene, camera);
        }
      }
      //Checking to see if it is an outer boundary
      else if(node instanceof THREE.Mesh && node.height >= 150)
      {
        //Checking for collision
        if((ghost.position.x - 3)  - node.position.x  == 0)
        {
          //Placing pacman back into place
          ghost.position.x = ghost.position.x + 1;
          //renderer.render(scene, camera);
        }
      }
    } );
  }

  if (ychange > 0)
  {
    scene.traverse( function( node )
    {
      //Setting x min and x max values to ensure pacman is infront of the barrier
      var maxleft = (node.position.x - (node.width/2));
      var maxright = (node.width/2) + node.position.x;
      //This excludes the outer boundaries of the map
      if (node instanceof THREE.Mesh && node.height < 150 && node.width < 150)
      {
        //If pacman is colliding with the barrier, and is in front of the barrier
        if(((ghost.position.y + 2)  - node.position.y  == 0) && (ghost.position.x >= maxleft && ghost.position.x <= maxright ))
        {
          //Move pacman back to original spot
          ghost.position.y = ghost.position.y - 1;
          //renderer.render(scene, camera);
        }
      }
      //If the barrier is large, then it is an outer barrier
      else if(node instanceof THREE.Mesh && node.width >= 150)
      {
        //Checking for the collision
        if((ghost.position.y + 2)  - node.position.y  == 0)
        {
          //Move pacman back into place
          ghost.position.y = ghost.position.y - 1;
          //renderer.render(scene, camera);
        }
      }
    });
  }

  if(ychange < 0)
  {
    scene.traverse( function( node )
    {
      //Setting x min and x max values to ensure pacman is infront of the barrier
      var maxleft = (node.position.x - (node.width/2));
      var maxright = (node.width/2) + node.position.x;
      //This excludes the outer boundaries of the map
      if (node instanceof THREE.Mesh && node.height < 150 && node.width < 150 )
      {
        //If pacman is colliding with the barrier, and is in front of the barrier
        if(((ghost.position.y - 2)  - node.position.y  == 0) && (ghost.position.x >= maxleft && ghost.position.x <= maxright ))
        {
          //Move pacman back to original spot
          ghost.position.y = ghost.position.y + 1;
          //renderer.render(scene, camera);
        }
      }
      //If the barrier is large, then it is an outer barrier
      else if(node instanceof THREE.Mesh && node.width >= 150)
      {
        //Checking for the collision
        if((ghost.position.y - 2)  - node.position.y  == 0)
        {
          //Move pacman back into place
          ghost.position.y = ghost.position.y + 1;
          //renderer.render(scene, camera);
        }
      }
    });
  }
}
// -----------------------------------------------------------------------------
function isPacmanDead(ghost, pacman)
{
  for(var i = 0; i < 4; i ++)
  {
    if((((pacman.position.x + i) - (ghost.position.x +2) == 0) || ((pacman.position.x - i) - (ghost.position.x - 2) == 0))
    && (((pacman.position.y + i) - (ghost.position.y + 2) == 0) || ((pacman.position.y - i) - (ghost.position.y - 2) == 0)))
    {

      return true;
    }
    else
    {
      return false;
    }
  }
}
// -----------------------------------------------------------------------------
function wait(ms){
   var start = new Date().getTime();
   var end = start;
   while(end < start + ms) {
     end = new Date().getTime();
  }
}
