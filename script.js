
var data;
var mobile = navigator.userAgent.match("Mobile") != null || navigator.userAgent.match("Linux;") != null;
//if (mobile) {
//	document.getElementById("container").style.filter = "url(#rgbShiftMobile)";
//	document.getElementById("container").style.webkitFilter = "url(#rgbShiftMobile)";
//}
var config = {
	apiKey: "AIzaSyD0vE-ikIn-oferi004B_e36WjvGmroyGk",
	authDomain: "ping-pong-masone.firebaseapp.com",
	databaseURL: "https://ping-pong-masone-default-rtdb.europe-west1.firebasedatabase.app",
	projectId: "ping-pong-masone",
	storageBucket: "ping-pong-masone.appspot.com",
	messagingSenderId: "742378994580",
	appId: "1:742378994580:web:a2b10a134fe65989d1ed81"
};
firebase.initializeApp(config);

var database = firebase.database();


function GoInFullscreen(element) {
	if (element.requestFullscreen)
		element.requestFullscreen();
	else if (element.mozRequestFullScreen)
		element.mozRequestFullScreen();
	else if (element.webkitRequestFullscreen)
		element.webkitRequestFullscreen();
	else if (element.msRequestFullscreen)
		element.msRequestFullscreen();


	screen.orientation.lock('landscape').then(res => console.log(res)).catch(err => console.log(err))
}

function info(){
	var r = document.getElementById("replace");
	r.innerHTML = '<div class="subtitle">PER QUESTO GIOCO SI HA BISOGONO DI 2 SCHERMI SULLO STESSO CODICE</div><div class="button" onclick="menu()">INIZIA</div>';
	GoInFullscreen($("body").get(0));
}
function menu(){
	var r = document.getElementById("replace");
	r.innerHTML = '<div class="subtitle">QUESTO È LO SCHERMO DI SINISTRA O DI DESTRA?</div><div class="button close" onclick="left()">SINISTRA</div><div class="button close" onclick="right()">DESTRA</div><';
}
function getCode(){
	var letters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	var c = "";
	for(var i = 0; i < 6; i++)
		c += letters[Math.floor(Math.random() * letters.length)];
	database.ref("/" + c).once("value", function(e){
		e = e.val();
		if(e)
			getCode();
		else
			game(c);
	});
}
function left(){
	var r = document.getElementById("replace");
	r.innerHTML = '<div class="subtitle">INSERIRE QUESTO CODICE NELLA SCHERMATA A DESTRA.</div><div class="title" id="code" style="margin-top: 10vmax">CARICAMENTO</div>';
	getCode();
}
function game(code){
	console.log(code);
	document.getElementById("code").innerHTML = code;
	database.ref("/" + code).on("value", function(e){
		if(e.val() == 2){
			var ratio = document.body.clientWidth / document.body.clientHeight;
			database.ref("/" + code).off();
			data = {
				x: ratio * 100,
				y: 50,
				d: 180,
				p1: {
					ratio: ratio,
					score: 0
				},
				p2: {
					ratio: 99999,
					score: 0
				},
				speed: 4
			};
			database.ref("/" + code).set(data);
			database.ref("/" + code).on("value", function(e){
				data = e.val();
				database.ref("/" + code).off();
				database.ref("/" + code).on("value", function(e){
					e = e.val();
					if(data.x > data.p1.ratio * 100)
						data = e;
				});
				database.ref("/" + code + "/p1/score").on("value", function(e){
					score.innerHTML = e.val();
				});
			});
			var r = document.getElementById("replace");
			r.innerHTML = "";
			var border = document.createElement("DIV");
			border.className = "border left";
			r.appendChild(border);
			var ball = document.createElement("DIV");
			ball.id = "ball";
			r.appendChild(ball);
			var paddle = document.createElement("DIV");
			paddle.id = "paddle";
			paddle.className = "leftp";
			paddle.style.top = document.body.clientHeight / 2 + "px";
			r.appendChild(paddle);
			var score = document.createElement("SPAN");
			score.id = "scorer";
			score.innerHTML = "0";
			r.appendChild(score);
			window.onmousemove = function(e){
				paddle.style.top = e.clientY + "px";
			}
			window.ontouchstart = function(e){
				paddle.style.top = e.touches[0].clientY + "px";
			}
			window.ontouchmove = function(e){
				e.preventDefault();
				paddle.style.top = e.touches[0].clientY + "px";
			}
			function update(time){
				requestAnimationFrame(update);
				ball.style.left = data.x + "vh";
				ball.style.top = data.y + "vh";
				data.x += Math.cos(data.d / 180 * Math.PI) * data.speed;
				data.y += Math.sin(data.d / 180 * Math.PI) * data.speed;
				if(data.y < 2.5){
					data.d *= -1;
					data.y = 2.5;
				}
				if(data.y > 100 - 2.5){
					data.d *= -1;
					data.y = 100 - 2.5;
				}
				if(data.x < 2.5){
					data.d = 180 - data.d;
					data.x = 2.5;
					database.ref("/" + code + "/speed").set(4);
					database.ref("/" + code + "/p2/score").once("value", function(e){
						database.ref("/" + code + "/p2/score").set(e.val() + 1);
					});
				}
				// if(data.x > data.p1.ratio * 100 + data.p2.ratio * 100 - 2.5){
				// 	data.d = 180 - data.d;
				// 	data.x = data.p1.ratio * 100 + data.p2.ratio * 100 - 2.5;
				// }
				if(data.x < 12.5 && Math.abs(data.y - parseInt(paddle.style.top) / document.body.clientHeight * 100) < 15){
					data.d = 4 * (data.y - parseInt(paddle.style.top) / document.body.clientHeight * 100);
					data.x = 12.5;
					database.ref("/" + code + "/speed").set(data.speed + 0.1);
				}
				if(data.x <= data.p1.ratio * 100){
					database.ref("/" + code + "/x").set(data.x);
					database.ref("/" + code + "/y").set(data.y);
					database.ref("/" + code + "/d").set(data.d);
				}
				//console.log(time - last);
				//last = time;
				console.log(time);
				window.scrollTo(0, 1); 
			}
			//var last = 0;
			update(performance.now());
		}
	});
	database.ref("/" + code).set(1);
}
function right(){
	var r = document.getElementById("replace");
	r.innerHTML = '<div class="subtitle">INSERIRE QUI IL CODICE DALLA SCHERMATA DI SINISTRA.</div><input class="title input" id="code" style="margin-top: 10vmax" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" autofocus oninput="checkCode(this)"/>';
}

function checkCode(e){
	console.log(11);
	if(e.value.length == 6){
		var code = e.value.toUpperCase();
		database.ref("/" + code).once("value", function(e){
			
			if(e.val() == 1){
				database.ref("/" + code).on("value", function(e){
					if(e.val() == 2){
						
						var ratio = document.body.clientWidth / document.body.clientHeight;
						database.ref("/" + code).off();
						data = {p1:{ ratio: 999999, score: 0 }};
						database.ref("/" + code).on("value", function(e){
							e = e.val();
							if(e != 2){
								data = e
								database.ref("/" + code).off();
								database.ref("/" + code + "/p2").set({
									ratio: ratio,
									score: 0
								});
								data.p2.ratio = ratio;
								database.ref("/" + code).on("value", function(e){
									e = e.val();
									if(data.x <= data.p1.ratio * 100)
										data = e;
								});
								database.ref("/" + code + "/p2/score").on("value", function(e){
									score.innerHTML = e.val();
								});
							}
						});
						var r = document.getElementById("replace");
						r.innerHTML = "";
						var border = document.createElement("DIV");
						border.className = "border right";
						r.appendChild(border);
						var ball = document.createElement("DIV");
						ball.id = "ball";
						r.appendChild(ball);
						var paddle = document.createElement("DIV");
						paddle.id = "paddle";
						paddle.className = "rightp";
						paddle.style.top = document.body.clientHeight / 2 + "px";
						r.appendChild(paddle);
						var score = document.createElement("SPAN");
						score.id = "scorel";
						score.innerHTML = "0";
						r.appendChild(score);
						data.p2 = {
							ratio: ratio,
							score: 0
						}
						window.onmousemove = function(e){
							paddle.style.top = e.clientY + "px";
						}
						window.ontouchstart = function(e){
							paddle.style.top = e.touches[0].clientY + "px";
						}
						window.ontouchmove = function(e){
							e.preventDefault();
							paddle.style.top = e.touches[0].clientY + "px";
						}
						//requestAnimationFrame(update);
	
						function update2(time){
							
							
							ball.style.left = (data.x - data.p1.ratio * 100) + "vh";
							ball.style.top = data.y + "vh";
							data.x += Math.cos(data.d / 180 * Math.PI) * data.speed;
							data.y += Math.sin(data.d / 180 * Math.PI) * data.speed;
							if(data.y < 2.5){
								data.d *= -1;
								data.y = 2.5;
							}
							if(data.y > 100 - 2.5){
								data.d *= -1;
								data.y = 100 - 2.5;
							}
							// if(data.x < 2.5){
							// 	data.d = 180 - data.d;
							// 	data.x = 2.5;
							// }
							if(data.x > data.p1.ratio * 100 + data.p2.ratio * 100 - 2.5){
								data.d = 180 - data.d;
								data.x = data.p1.ratio * 100 + data.p2.ratio * 100 - 2.5;
								database.ref("/" + code + "/speed").set(4);
								database.ref("/" + code + "/p1/score").once("value", function(e){
									database.ref("/" + code + "/p1/score").set(e.val() + 1);
								});
							}
							paddle.style.left = data.p2.ratio * 100 - 7.5 + "vh";
							
							h = document.getElementById('paddle').style.top;
							
								if (Math.abs(data.y - parseInt(h) / document.body.clientHeight * 100) < 15) {
									if (data.x > data.p1.ratio * 100 + data.p2.ratio * 100 - 12.5) {
										if (paddle.style.top == h) {
											data.d = 180 - 4 * (data.y - parseInt(paddle.style.top) / document.body.clientHeight * 100);
								data.x = data.p1.ratio * 100 + data.p2.ratio * 100 - 12.5;
								database.ref("/" + code + "/speed").set(data.speed + 0.1);
										}
										
									}
								}
	
						
							if(data.x > data.p1.ratio * 100){
								database.ref("/" + code + "/x").set(data.x);
								database.ref("/" + code + "/y").set(data.y);
								database.ref("/" + code + "/d").set(data.d);
							}
							//console.log(time - last);
							//last = time;
							console.log(time);
							window.scrollTo(0, 1); 
							//console.log(1)
							
								requestAnimationFrame(update2);
							
						
						
					
						}
						//var last = 0;
						//requestAnimationFrame(update);
						//requestAnimationFrame(update);
						
						update2(performance.now);
						
					}
				});
				database.ref("/" + code).set(2);
			}
		});
	}
}