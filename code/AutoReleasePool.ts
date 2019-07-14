/// <reference path="G.ts" />

import { Reference} from "./Reference";
import {G} from "./G";
import {Vector} from "./Vector";

export class AutoReleasePool {
    private isClearing: boolean;
    private static _id: number = -1;
    private _name: string;
    private _managedObjectArray: Vector<Reference> = new Vector<Reference>();
    constructor(name: string  = null) {
        this._name = name;
        AutoReleasePool._id++;
        G.IF_DEFINE_DEBUG && (this.isClearing = false);
        G.IF_DEFINE_DEBUG && G.ASSERT(!this._managedObjectArray, 'Error:_managedObjectArray is null!');
        this._managedObjectArray.Reserve(50, true);
        PoolManager.Instance.Push(this);
    }

    public IsClearing(): boolean {
        return this.isClearing;
    }

    public AddObject(object: Reference): void {
        object.GroupID = AutoReleasePool._id;
        this._managedObjectArray.Push(object);
    }

    public Contains(object: Reference): boolean {
        return this._managedObjectArray.Contains(object);
    }

    public Clear(): void {
        G.IF_DEFINE_DEBUG && (this.isClearing = true);
        for (let i: number = 0; i < this._managedObjectArray.Length(); ++i)
        {
            this._managedObjectArray.Back(i).Release();
        }
        this._managedObjectArray.Clear();
        G.IF_DEFINE_DEBUG && (this.isClearing = false);
    }

    public Dump(): void {
        G.DEBUG_LOG('autorelease pool '+AutoReleasePool._id+': '+this._name.toString()+', number of managed object '+this._managedObjectArray.Length());

    }
}

export class PoolManager {
    private _releasePoolStack: Vector<AutoReleasePool> = new Vector<AutoReleasePool>();
    private static _ins: PoolManager = null;
   constructor() {
       G.IF_DEFINE_DEBUG && G.ASSERT(!this._releasePoolStack, 'Error:_releasePoolStack is null!');
        this._releasePoolStack.Reserve(10, true);
   }

   public static get Instance(): PoolManager {
       if (!this._ins) {
           this._ins = new PoolManager();
           let pool: AutoReleasePool = new AutoReleasePool('Resource autorelease pool');
           G.IF_DEFINE_DEBUG && G.ASSERT(!pool, 'Error:pool is null!');
       }
       return this._ins;
   }

   public static PurgePoolManager(): void {
        this.DestroyPoolManager();
   }

   public static DestroyPoolManager(): void {
        delete this._ins;
        this._ins = null;
   }

   public AddAutoRelease(): boolean {
       return new AutoReleasePool('Resource autorelease pool') ? true : false;
   }

   public GetCurrentPool(index: number): AutoReleasePool {
       return this._releasePoolStack.Back(index);
   }

   public Push(pool:AutoReleasePool): void
   {
       this._releasePoolStack.Push(pool);
   }
   
   public Pop(): AutoReleasePool
   {
       return this._releasePoolStack.Pop();
   }

   public ClearOf(index: number): void {
       G.IF_DEFINE_DEBUG && G.ASSERT(!this._releasePoolStack.Back(index), 'Error:Cannot read property of null!');
       this._releasePoolStack.Back(index).Clear();
   }

   public Clear(): void {
       for (let i: number = 0; i < this._releasePoolStack.Length(); ++i) {
           let pool: AutoReleasePool = this.Pop();
           G.IF_DEFINE_DEBUG && G.ASSERT(!pool, 'Error:pool is null!');
           pool.Clear();
       }
   }

   public IsObjectInPools(object: Reference): boolean {
        for (let key: number = 0; key < this._releasePoolStack.Length(); ++key) {
            if (this._releasePoolStack.Back(key).Contains(object)) {
                return true;
            }
        }
        return false;
   }
}
