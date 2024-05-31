let robot;
let walls = [];
let sensorRange = 10 + 50; // センサーの検出範囲（距離）

function setup() {
    createCanvas(800, 600);
    robot = new Robot(150, 220);
    // 教科書の図5.18と同じようなステージを設定
    walls.push(new Wall(500, 100, 700, 100));  
    walls.push(new Wall(500, 100, 500, 200));   
    walls.push(new Wall(100, 200, 500, 200));   
    walls.push(new Wall(100, 200, 100, 500));  
    walls.push(new Wall(100, 500, 700, 500));  
    walls.push(new Wall(700, 100, 700, 500));  
}

function draw() {
    background(255);
    for (let wall of walls) {
        wall.show();
    }
    // ロボットの位置と角度を更新
    robot.update();
    // ロボットの描画
    robot.show();
}

// ロボットの設定（位置，角度，速度）
class Robot {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.angle = 0;　// 正面
        this.speed = 2;
    }

    update() {
        let leftDistance = this.getSensorDistance(this.angle + 45);
        let rightDistance = this.getSensorDistance(this.angle - 45);
        let frontDistance = this.getSensorDistance(this.angle);

        if (frontDistance < sensorRange && leftDistance < sensorRange) {
            this.angle += 40; // ルールA
        } else if (!(leftDistance < sensorRange - 5) && !(rightDistance < sensorRange - 5) && !(frontDistance < sensorRange)){
          this.angle -= 40; // ルールB
        } else if(leftDistance <= sensorRange - 5){
          this.angle += 13.5; // ルールC
        } else if(leftDistance >= sensorRange - 5){
          this.angle -= 13.5; // ルールD
        }
        this.pos.x += cos(radians(this.angle)) * this.speed;
        this.pos.y += sin(radians(this.angle)) * this.speed;
    }

    getSensorDistance(sensorAngle) {
        // センサの先端の座標を計算
        // ロボットの現在座標 ＋ 方向（-1~1） X センサーの検出範囲
        let sensorX = this.pos.x + cos(radians(sensorAngle)) * sensorRange;
        let sensorY = this.pos.y + sin(radians(sensorAngle)) * sensorRange;
        let minDistance = sensorRange;

        for (let wall of walls) {
            let distance = wall.distanceToPoint(sensorX, sensorY);
            if (distance < minDistance) {
                minDistance = distance;
            }
        }
        return minDistance;
    }

    show() {
        fill(0, 0, 255);
        noStroke();
        ellipse(this.pos.x, this.pos.y, 50, 50);
    }
}

class Wall {
    constructor(x1, y1, x2, y2) {
        this.a = createVector(x1, y1);
        this.b = createVector(x2, y2);
    }
    // 壁とセンサの先端との距離を計算
    distanceToPoint(px, py) {
        // 壁の両端の差を計算
        const l2 = distSq(this.a, this.b);
        // 壁の両端が同じ点（線分の長さが0）である場合
        if (l2 == 0) return dist(px, py, this.a.x, this.a.y);
        // センサの先端から壁への垂直投影点を計算
        const t = max(0, min(1, dotProduct(px, py, this.a, this.b) / l2));
        // 壁上の垂直投影点（センサの先端から壁上の最も近い点）を計算
        const projection = createVector(
            this.a.x + t * (this.b.x - this.a.x),
            this.a.y + t * (this.b.y - this.a.y)
        );
        return dist(px, py, projection.x, projection.y);
    }

    show() {
        stroke(0);
        line(this.a.x, this.a.y, this.b.x, this.b.y);
    }
}
// 2点間の距離の二乗
function distSq(v, w) {
    return (v.x - w.x) * (v.x - w.x) + (v.y - w.y) * (v.y - w.y);
}
// 2つのベクトルの内積を計算
// 内積は、2つのベクトルの方向の類似性を測定するために使用
function dotProduct(px, py, v, w) {
    return (px - v.x) * (w.x - v.x) + (py - v.y) * (w.y - v.y);
}
