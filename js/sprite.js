class BackgroundSprite {

    constructor(sprite_json) {
        this.sprite_json = sprite_json;
        this.state = 'idle';

        this.root_e = "acid_bk";
        this.cur_frame = 0;
        this.x = 0;
        this.y = 0;
    }
    
    draw(state) {
        var ctx = canvas.getContext('2d');
        if (this.sprite_json[this.root_e][this.state][this.cur_frame]['img'] == null) {
            console.log("loading Bk");
            this.sprite_json[this.root_e][this.state][this.cur_frame]['img'] = new Image();
            this.sprite_json[this.root_e][this.state][this.cur_frame]['img'].src = 'acid_bk/' + this.root_e + '/' + this.state + '/' + this.cur_frame + '.png';
        }

        ctx.drawImage(this.sprite_json[this.root_e][this.state][this.cur_frame]['img'],
            this.x, this.y, window.innerWidth, window.innerHeight);

        this.cur_frame = this.cur_frame + 1;
        if (this.cur_frame >= this.sprite_json[this.root_e][this.state].length) {
            this.cur_frame = 0;
        }

        return true;
    }
}

//Parent Sprite Classa
class Sprite {
    constructor(sprite_json, x, y, x_v, y_v, start_state) {
        this.sprite_json = sprite_json;
        this.x = x;
        this.y = y;
        this.state = start_state;
        //this.root_e = "Sonic";
        this.root_e = "TenderBud";

        this.cur_frame = 0;

        this.cur_dir = "";

        this.b_hit = false;

        this.cur_bk_data = null;

        this.wave = false;
        this.count = 0;

        //velocity vector
        this.x_v = x_v;
        this.y_v = y_v;

        //acceleration vector
        this.x_a = 0;
        this.y_a = 0;

        this.prev_x_v = 0;
        this.prev_y_v = 0;
    }

    //calculate distance
    distance(sprite1, sprite2) {
        let d = ((sprite1.x - sprite2.x) ** 2 + (sprite1.y - sprite2.y) ** 2) ** (1 / 2);
        return d;
    }

    next_distance(sprite1, sprite2) {
        let d = (((sprite1.x + sprite1.x_v) - (sprite2.x + sprite2.x_v)) ** 2 + ((sprite1.y + sprite1.y_v) - (sprite2.y + sprite2.y_v)) ** 2) ** (1 / 2);
        return d;
    }



    set_magnitude(x, y, max) {
        let magn = (x ** 2 + y ** 2) ** (1 / 2);
        let new_vec = [x, y];

        let cm = magn / max;
        new_vec[0] = Math.round((x / cm) * 10000) / 10000;
        new_vec[1] = Math.round((y / cm) * 10000) / 10000;

        return new_vec;
    }

    limit_magnitude(x, y, max) {
        let magn = (x ** 2 + y ** 2) ** (1 / 2);
        let new_vec = [x, y];

        if (magn > max) {
            let cm = magn / max;
            new_vec[0] = Math.round((x / cm) * 100) / 100;
            new_vec[1] = Math.round((y / cm) * 100) / 100;
        }
        return new_vec;
    }


    align(sprites) {
        console.log('align');
        const radius = 200;

        let steer = [0, 0];

        let counter = 0;
        let avg_x_v = 0;
        let avg_y_v = 0;

        for (let other of sprites) {
            if (other != this) {
                if (this.distance(this, other) < radius) {
                    avg_x_v += other.x_v;
                    avg_y_v += other.y_v;
                    counter++;
                }
            }
        }
        if (counter > 0) {
            //div
            avg_x_v = avg_x_v / counter;
            avg_y_v = avg_y_v / counter;

            //setMag
            // let speed_up = this.set_magnitude(avg_x_v, avg_y_v, 5);
            // avg_x_v = speed_up[0];
            // avg_y_v = speed_up[1];

            //sub
            steer[0] = avg_x_v - this.x_v;
            steer[1] = avg_y_v - this.y_v;

            //limit
            let final_steer = this.limit_magnitude(steer[0], steer[1], 0.8);
            steer[0] = final_steer[0];
            steer[1] = final_steer[1];
        }
        return steer;
    }


    cohesion(sprites) {
        console.log('cohesion');
        const radius = 150;

        let steer = [0, 0];

        let counter = 0;
        let avg_x = 0;
        let avg_y = 0;
        for (let other of sprites) {
            if (other != this) {
                if (this.distance(this, other) < radius) {
                    avg_x += other.x;
                    avg_y += other.y;
                    counter++;
                }
            }
        }
        if (counter > 0) {
            //div
            avg_x = avg_x / counter;
            avg_y = avg_y / counter;

            //sub
            steer[0] = avg_x - this.x;
            steer[1] = avg_y - this.y;

            //setMag
            // let speed_up = this.set_magnitude(steer[0], steer[1], 5);
            // steer[0] = speed_up[0];
            // steer[1] = speed_up[1];


            //sub
            steer[0] = steer[0] - this.x_v;
            steer[1] = steer[1] - this.y_v;

            //limit
            let final_steer = this.limit_magnitude(steer[0], steer[1], 0.3);
            steer[0] = final_steer[0];
            steer[1] = final_steer[1];

        }
        return steer;
    }

    //
    separation(sprites) {
        console.log('separation');
        const radius = 300;

        let steer = [0, 0];

        let counter = 0;
        let avg_x = 0;
        let avg_y = 0;
        for (let other of sprites) {
            if (other != this) {
                let distance = this.distance(this, other);
                if (distance < radius && distance > 0) {
                    let diff = [this.x - other.x, this.y - other.y];
                    //console.log(diff[0], ',', diff[1], '<==================== DIFF');

                    diff[0] = diff[0] / distance;
                    diff[1] = diff[1] / distance;
                    //console.log(diff[0], ',', diff[1], '<==================== SCALED DIFF');

                    avg_x += diff[0];
                    avg_y += diff[1];
                    counter++;
                }
            }
        }
        if (counter > 0) {
            //div
            // avg_x = avg_x / counter;
            // avg_y = avg_y / counter;



            // steer[0] = avg_x; - this.x_v;
            // steer[1] = avg_y; - this.y_v;

            // console.log(steer[0],',',steer[1],'<==================== FINAL STEER');

            //div
            avg_x = avg_x / counter;
            avg_y = avg_y / counter;

            //setMag
            let speed_up = this.set_magnitude(avg_x, avg_y, 5);
            steer[0] = speed_up[0];
            steer[1] = speed_up[1];


            //sub
            steer[0] = steer[0] - this.x_v;
            steer[1] = steer[1] - this.y_v;

            //limit
            let final_steer = this.limit_magnitude(steer[0], steer[1], 0.9);
            steer[0] = final_steer[0];
            steer[1] = final_steer[1];

        }
        return steer;
    }


    opposite_dir(dir1, dir2) {
        if (dir1 == "N" && dir2 == "S") {
            return true;
        }
        else if (dir1 == "NE" && dir2 == "SW") {
            return true;
        }
        else if (dir1 == "E" && dir2 == "W") {
            return true;
        }
        else if (dir1 == "SE" && dir2 == "NW") {
            return true;
        }
        else {
            return false;
        }
    }

    interaction(sprites) {
        console.log('interaction');
        const radius = 100;

        let steer = [0, 0];

        for (let other of sprites) {
            if (other != this) {
                let distance = this.distance(this, other);
                let nextDistance = this.next_distance(this, other);
                if (distance < radius && distance > nextDistance) {
                    let check_dirs1 = this.opposite_dir(this.cur_dir, other.cur_dir);
                    let check_dirs2 = this.opposite_dir(other.cur_dir, this.cur_dir);

                    if (check_dirs1 === true || check_dirs2 === true) {
                        this.count = 22;
                        other.count = 22;
                        this.set_dir_animation("iw", "idleWave");
                        other.set_dir_animation("iw", "idleWave");
                    }
                }
            }
        }

        return steer;
    }

    flock(sprites) {
        this.x_a = 0;
        this.y_a = 0;

        let alignment = this.align(sprites);
        this.x_a += alignment[0];
        this.y_a += alignment[1];

        let cohesion = this.cohesion(sprites);
        this.x_a += cohesion[0];
        this.y_a += cohesion[1];

        let separation = this.separation(sprites);
        this.x_a += separation[0];
        this.y_a += separation[1];

        this.x_v += this.x_a;
        this.y_v += this.y_a;

        let new_v = this.set_magnitude(this.x_v, this.y_v, 5);
        this.x_v = new_v[0];
        this.y_v = new_v[1];

        this.direction_animation(this.x_v, this.y_v);

        this.interaction(sprites);
    }

    set_dir_animation(new_dir, new_state) {
        this.count--;
        if (new_dir != this.cur_dir) {
            this.cur_frame = 0;
            this.cur_dir = new_dir;
        }

        this.state = new_state;
    }

    direction_animation(x, y) {
        if (this.count > 0){//this.wave === true) {
            this.set_dir_animation("iw", "idleWave");
        } else {
            if (x < 0 && y < 0) {
                this.set_dir_animation("NW", "walk_NW");
            }
            else if (x == 0 && y < 0) {
                this.set_dir_animation("N", "walk_N");
            }
            else if (x > 0 && y < 0) {
                this.set_dir_animation("NE", "walk_NE");
            }
            else if (x > 0 && y == 0) {
                this.set_dir_animation("E", "walk_E");
            }
            else if (x > 0 && y > 0) {
                this.set_dir_animation("SE", "walk_SE");
            }
            else if (x == 0 && y > 0) {
                this.set_dir_animation("S", "walk_S");
            }
            else if (x < 0 && y > 0) {
                this.set_dir_animation("SW", "walk_SW");
            }
            else{
                this.set_dir_animation("W", "walk_W");
            }
        }


    }


    draw(state) {
        var ctx = canvas.getContext('2d');
        //console.log(this.sprite_json[this.root_e][this.state][this.cur_frame]['w']);
        //console.log(state['key_change']);

        if (this.sprite_json[this.root_e][this.state][this.cur_frame]['img'] == null) {
            console.log("loading");
            this.sprite_json[this.root_e][this.state][this.cur_frame]['img'] = new Image();
            this.sprite_json[this.root_e][this.state][this.cur_frame]['img'].src = 'Penguins/' + this.root_e + '/' + this.state + '/' + this.cur_frame + '.png'; //'Sonic/' + this.root_e + '/' + this.state + '/' + this.cur_frame + '.png';
        }

        if (this.cur_bk_data != null && state['has_background_changed'] == false) {
            ctx.putImageData(this.cur_bk_data, (this.x - this.prev_x_v), (this.y - this.prev_y_v));//this.cur_bk_data , (this.x - this.x_v) , (this.y - this.y_v));
        }

        this.prev_x_v = Math.round(this.x_v);
        this.prev_y_v = Math.round(this.y_v);

        this.cur_bk_data = ctx.getImageData(this.x, this.y,
            this.sprite_json[this.root_e][this.state][this.cur_frame]['w'],
            this.sprite_json[this.root_e][this.state][this.cur_frame]['h']);


        ctx.drawImage(this.sprite_json[this.root_e][this.state][this.cur_frame]['img'], this.x, this.y);

        this.cur_frame = this.cur_frame + 1;
        if (this.cur_frame >= this.sprite_json[this.root_e][this.state].length) {
            //console.log(this.cur_frame);
            this.cur_frame = 0;
        }

        var map_context = offscreen.getContext('2d');
        var data = map_context.getImageData(this.x + this.sprite_json[this.root_e][this.state][this.cur_frame]['w'],
            this.y, 1, 1).data;
        var rgb = [data[0], data[1], data[2]];

        //console.log(rgb);
        // if (data[0] == 255 && data[1] == 0 && data[2] == 0) {
        //     this.bound_hit('F');
        // } else 
        if (this.x > (window.innerWidth - this.sprite_json[this.root_e][this.state][this.cur_frame]['w'])) {
            this.bound_hit('E');
        } else if (this.x <= 0) {
            this.bound_hit('W');
        } else if (this.y >= (window.innerHeight - this.sprite_json[this.root_e][this.state][this.cur_frame]['h'])) {
            this.bound_hit('S');
        } else if (this.y <= 0) {
            this.bound_hit('N');
        }
        else {
            this.b_hit = false;
            this.x = this.x + Math.round(this.x_v);
            this.y = this.y + Math.round(this.y_v);
        }
        return false;

    }

    set_idle_state() {
        this.x_v = -this.x_v;
        this.y_v = -this.y_v;
        const idle_state = ["idle", "idleBackAndForth", "idleBreathing", "idleFall", "idleLayDown", "idleLookAround", "idleLookDown", "idleLookLeft", "idleLookRight", "idleLookUp", "idleSit", "idleSpin", "idleWave"];
        this.state = 'idle'; // idle_state[random];
    }

    bound_hit(side) {
        console.log(side);
        //this.set_idle_state();
        let x = 0;
        let y = 0;

        if (this.b_hit === false) {
            this.x_v = -this.x_v;
            this.y_v = -this.y_v;
        }

        this.b_hit = true;

        if (side === 'N') {
            y = 50;
        }
        else if (side === 'E') {
            x = -50;
        }
        else if (side === 'S') {
            y = -50;
        }
        else {
            x = 50;
        }



        this.x = this.x + Math.round(this.x_v) + x;
        this.y = this.y + Math.round(this.y_v) + y;
    }


}
