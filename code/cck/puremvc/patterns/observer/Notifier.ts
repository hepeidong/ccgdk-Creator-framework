import { Facade } from "../facade/Facade";

/**
 * A base <code>INotifier</code> implementation.
 *
 * <code>MacroCommand</code>, <code>SimpleCommand</code>, <code>Mediator</code> and
 * <code>Proxy</code> all have a need to send <code>Notifications</code>.
 * 
 * The <code>INotifier</code> interface provides a common method called
 * <code>sendNotice</code> that relieves implementation code of the necessity to actually
 * construct <code>Notification</code>s.
 *
 * The <code>INotifier</code> interface, which all of the above mentioned classes extend,
 * provides an initialized reference to the <code>Facade</code> singleton, which is required by
 * the convenience method <code>sendNotice</code>	for sending <code>Notifications</code>,
 * but it also eases implementation as these classes have frequent <code>Facade</code>
 * interactions and usually require access to the facade anyway.
 */
export class Notifier implements INotifier {
	/**
	 * Local reference to the singleton <code>Facade</code>.
	 *
	 * @protected
	 */
	private facade: IFacade = null;
	/**
	 * Constructs a <code>Notifier</code> instance.
	 */
    constructor() {
        this.facade = Facade.getInstance();
    }
	/**
	 * Create and send a <code>Notification</code>.
	 *
	 * Keeps us from having to construct new <code>Notification</code> instances in our
	 * implementation code.
	 * 
	 * @param name
	 * 		The name of the notification to send.
	 * 
	 * @param body
	 * 		The body of the notification.
	 *
	 * @param type
	 * 		The type of the notification.
	 */
    sendNotice(name: string, body: any = null, type: string = null): void {
        this.facade.sendNotice(name, body, type);
    }
}