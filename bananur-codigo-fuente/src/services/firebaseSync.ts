import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Order, Workstation, Consultation, Product } from '../types';

const ORDERS_COLLECTION = 'orders';
const WORKSTATIONS_COLLECTION = 'workstations';
const PRODUCTS_COLLECTION = 'products';
const CONSULTATIONS_COLLECTION = 'consultations';

/**
 * Persist an order to Firestore
 */
export async function saveOrderToFirestore(order: Order): Promise<void> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, order.id);
    await setDoc(docRef, {
      id: order.id,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone || '',
      address: order.address,
      commune: order.commune,
      city: order.city,
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      total: order.total,
      status: order.status,
      date: order.date,
      type: order.type || 'boleta',
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${ORDERS_COLLECTION}/${order.id}`);
  }
}

/**
 * Persist workstations to Firestore
 */
export async function saveWorkstationsToFirestore(workstations: Workstation[]): Promise<void> {
  try {
    for (const ws of workstations) {
      const docRef = doc(db, WORKSTATIONS_COLLECTION, ws.id);
      await setDoc(docRef, {
        id: ws.id,
        code: ws.code,
        name: ws.name,
        type: ws.type,
        responsible: ws.responsible || 'Equipo Taller',
        description: ws.description || '',
        isActive: ws.isActive,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, WORKSTATIONS_COLLECTION);
  }
}

/**
 * Subscribe to realtime orders from Firestore
 */
export function subscribeOrdersFromFirestore(
  onOrdersReceived: (orders: Partial<Order>[]) => void
): () => void {
  try {
    const q = query(collection(db, ORDERS_COLLECTION), limit(50));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: Partial<Order>[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as Partial<Order>);
        });
        if (list.length > 0) {
          onOrdersReceived(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, ORDERS_COLLECTION);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, ORDERS_COLLECTION);
    return () => {};
  }
}
