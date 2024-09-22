import { DataReader, app, decorator } from "../../cck";
import { EventType } from "../EventType";
import { HeroWeapon } from "../battleSystem/dataType";

const {cckclass, model} = decorator;

type WeaponId = {id: number}

class HeroData {
    id: number;
    name: string;
    hp: number;
    exp: number;
    level: number;
    currentHp: number;
    weapon: HeroWeapon & WeaponId = {} as HeroWeapon & WeaponId;
}

@cckclass("HeroModel")
@model(HeroData)
export class HeroModel extends app.Document<HeroData> {

    onCreate(): void {
        this.data.id = DataReader.file.Hero.get(1000).id;
        this.data.exp = DataReader.file.Hero.get(1000).exp;
        this.data.hp = DataReader.file.Hero.get(1000).HP;
        this.data.name = DataReader.file.Hero.get(1000).name;
        this.data.level = DataReader.file.Hero.get(1000).level;
        this.data.currentHp = DataReader.file.Hero.get(1000).HP;
        this.data.weapon.attack = DataReader.file.HeroWeapon.get(1100).attack;
        this.data.weapon.attackDistance = DataReader.file.HeroWeapon.get(1100).attackDistance;
        this.data.weapon.bulletCount = DataReader.file.HeroWeapon.get(1100).bulletCount;
        this.data.weapon.bulletSpeed = DataReader.file.HeroWeapon.get(1100).bulletSpeed;
        this.data.weapon.cd = DataReader.file.HeroWeapon.get(1100).cd;
        this.data.weapon.weaponType = DataReader.file.HeroWeapon.get(1100).type;
        this.data.weapon.id = DataReader.file.HeroWeapon.get(1100).id;
    }

    public updateHp(hp: number) {
        if (this.data.currentHp > 0) {
            this.data.currentHp -= hp;
            if (this.data.currentHp < 0) {
                this.data.currentHp = 0;
            }
        }
        this.sendNotice(EventType.UPDATE_HP, this.data.currentHp);
    }
}