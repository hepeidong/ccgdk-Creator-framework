import { Notifier } from "../observer/Notifier";

/**
 * A base <code>IProxy</code> implementation. 
 *
 * In PureMVC, <code>IProxy</code> implementors assume these responsibilities:
 * <UL>
 * <LI>Implement a common method which returns the name of the Proxy.
 * <LI>Provide methods for setting and getting the data object.
 *
 * Additionally, <code>IProxy</code>s typically:
 * <UL>
 * <LI>Maintain references to one or more pieces of model data.
 * <LI>Provide methods for manipulating that data.
 * <LI>Generate <code>INotifications</code> when their model data changes.
 * <LI>Expose their name as a <code>constant</code> called <code>NAME</code>, if they are not
 * instantiated multiple times.
 * <LI>Encapsulate interaction with local or remote services used to fetch and persist model
 * data.
 */
export class Proxy<T> extends Notifier implements IProxy, INotifier {
	/**
	 * The data object controlled by the <code>Proxy</code>.
	 *
	 * @private
	 */
    private proxyName: string = null;
	/**
	 * The name of the <code>Proxy</code>.
	 *
	 * @private
	 */
    // private _data: T = null;
	/**
	 * Constructs a <code>Proxy</code> instance.
	 *
	 * @param proxyName
	 * 		The name of the <code>Proxy</code> instance.
	 *
	 * @param data
	 * 		An initial data object to be held by the <code>Proxy</code>.
	 */
    constructor(proxyName: string = null, data: any = null) {
        super();
        this.proxyName = (proxyName != null) ? proxyName : Proxy.NAME;
        if (data != null)
            this.setData(data);
    }

	public get data(): T { return this["_data"]; }

	setProxyName(proxyName: string): void {
		this.proxyName = proxyName;
	}
	/**
	 * Get the name of the <code>Proxy></code> instance.
	 *
	 * @return
	 * 		The name of the <code>Proxy></code> instance.
	 */
    getProxyName(): string {
        return this.proxyName;
    }
	/**
	 * Set the data of the <code>Proxy></code> instance.
	 *
	 * @param data
	 * 		The data to set for the <code>Proxy></code> instance.
	 */
    setData(data: T): void {
        this["_data"] = data;
    }
	/**
	 * Get the data of the <code>Proxy></code> instance.
	 *
	 * @return
	 * 		The data held in the <code>Proxy</code> instance.
	 */
    getData(): T {
        return this.data;
    }
	/**
	 * Called by the Model when the <code>Proxy</code> is registered. This method has to be
	 * overridden by the subclass to know when the instance is registered.
	 */
    onRegister(): void {
    }
	/**
	 * Called by the Model when the <code>Proxy</code> is removed. This method has to be
	 * overridden by the subclass to know when the instance is removed.
	 */
    onRemove(): void {
    }
	/**
	 * The default name of the <code>Proxy</code>
	 * 
	 * @type
	 * @constant
	 */
    static NAME: string = "Proxy";
}
