import Game from "../core/game.js";
import Editor from "../editor/editor.js";

const canvas = document.getElementById("game");

let font;
let editor;

let infoText;
let time = 0;

const game = new Game(canvas, {
    load: () => {
        console.log("load");
        game.resourceManager.loadFont("font", "./resources/data/fonts/font.json");
    },
    create: () => {
        console.log("create");

        font = game.resourceManager.get('font');

        game.camera.zoom = 2;
        game.camera.update();

        editor = new Editor(game)
        editor.initialize();

        // Create download button
        const downloadButton = document.getElementById("download");
        if (!downloadButton) {
            const button = document.createElement("button");
            button.id = "download";
            button.innerText = "Download";
            button.onclick = () => {

                // Download world data
                let data = localStorage.getItem('data') || [];
                const json = JSON.stringify(data);
                const blob = new Blob([json], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "world.json";
                a.click();

            };
            document.body.appendChild(button);
            button.style.position = "absolute";
            button.style.top = "10px";
            button.style.right = "10px";
        }

        // Create Save button
        const saveButton = document.getElementById("save");
        if (!saveButton) {
            const button = document.createElement("button");
            button.id = "save";
            button.innerText = "Save";
            button.onclick = () => {
                editor.saveVertices();
                infoText = "Saved!";
            }
            document.body.appendChild(button);
            button.style.position = "absolute";
            button.style.top = "10px";
            button.style.right = "100px";
        }

    },
    update: () => {

        editor.update();
      
    },
    render: () => {

        const camera = game.camera;
        camera.clearScreen();

        editor.render();        

        camera.spriteRenderer.projectionMatrix = camera.projection;
        camera.spriteRenderer.begin(camera);
        font.render({
            renderer: camera.spriteRenderer,
            text: "FPS: " + game.fps,
            x: -camera.bounds.width  * 0.5 + 10,
            y: -camera.bounds.height * 0.5 + 10,
            color: 0xFFFFFFFF, shadowEnabled: true,
        });
        const mousePosition = editor.getMousePosition();
        font.render({
            renderer: camera.spriteRenderer,
            text: `Mouse: ${mousePosition.x.toFixed(2)}, ${mousePosition.y.toFixed(2)}`,
            x: -camera.bounds.width  * 0.5 + 10,
            y: -camera.bounds.height * 0.5 + 25,
            color: 0xFFFFFFFF, shadowEnabled: true,
        });
        if (infoText) {
            font.render({
                renderer: camera.spriteRenderer,
                text: infoText,
                x: -camera.bounds.width * 0.5 + 10,
                y: camera.bounds.height * 0.5 - 10,
                color: 0xFFFFFFFF, shadowEnabled: true,
            });
            time++;
            if (time > 60) {
                infoText = null;
                time = 0;
            }
        }
        camera.spriteRenderer.flush();

    }
});

game.start();