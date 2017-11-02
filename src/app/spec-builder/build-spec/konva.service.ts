import { Injectable } from '@angular/core';
import * as Konva from 'konva';

@Injectable()
export class KonvaService {
    stage;
    layer;
    dragLayer;

    constructor() { }
    
    buildImage(image, layer, stage) {
        console.log('building image!');
        let imageObj = new Image();
            imageObj.onload = function() {
                let img = new Konva.Image({
                    x: image.xPos,
                    y: image.yPos,
                    image: imageObj,
                    width: 50,
                    height: 50,
                    draggable: true,
                });
                //img.cache();
                //img.drawHitFromCache(0);

                layer.add(img);
                stage.add(layer);

            };
            imageObj.src = image.url;
         console.log('image built!');
        return imageObj;
    }

    buildStage(container) {

        this.stage = new Konva.Stage({
            container: container,
            width: 512,
            height: 512,
        });

        this.layer = new Konva.Layer();
        this.dragLayer = new Konva.Layer();

        /*
        var circle = new Konva.Circle({
              x: this.stage.getWidth() / 2,
              y: this.stage.getHeight() / 2,
              radius: 70,
              fill: 'red',
              stroke: 'black',
              strokeWidth: 4
            });
        this.layer.add(circle)
        */
        
        this.stage.add(this.layer, this.dragLayer);
    }

    onDrop(image) {
        console.log('konva drop!');
        let img = this.buildImage(
            image, this.layer, this.stage);
        console.log('adding image!');
    }

    onDragStart(event) {
        this.stage.on('dragstart', function(event) {
          var shape = event.target;
          // moving to another layer will improve dragging performance
          shape.moveTo(this.dragLayer);
          this.stage.draw();
        });
    }

    onDragEnd(event) {
        this.stage.on('dragend', function(event) {
          var shape = event.target;
          shape.moveTo(this.layer);
          this.stage.draw();
          shape.to({
            duration: 0.5,
            easing: Konva.Easings.ElasticEaseOut,
          });
        });
    }
}