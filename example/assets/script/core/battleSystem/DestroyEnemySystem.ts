import { IEntity, decorator, ecs } from "../../cck";
import { NpcType } from "../../lib/NpcTypeEnum";
import { Enemy } from "../view/battleView/Enemy";
import { DirectionSystem } from "./DirectionSystem";
import { DataType, NpcIdentity } from "./dataType";

const {cckclass, updateBefore} = decorator;

interface IEnemyEntity extends IEntity {
    NpcIdentity: NpcIdentity;
}

@cckclass("DestroyEnemySystem")
@updateBefore(DirectionSystem)
export class DestroyEnemySystem extends ecs.System<IEnemyEntity> {


    protected onUpdate(dt: number): void {
        this.matcher.withAll(DataType.NpcIdentity).forEach(entity => {
            if (entity.NpcIdentity.identity === NpcType.Enemy) {
                if (entity.NpcIdentity.die) {
                    const die = entity.node.getComponent(Enemy).getDie();
                    if (die) {
                        this.destroyEntity(entity);
                    }
                }
            }
        });
    }
}