import java.util.concurrent.atomic.AtomicInteger;


public class AtomicIntegerTest {

    public static void main(String[] args) throws InterruptedException{
        final AtomicInteger value = new AtomicInteger(10);
        System.out.println(!value.compareAndSet(1, 2));
        System.out.println(value.get() == 10);
        System.out.println(value.compareAndSet(10, 3));
        System.out.println(value.get() == 3);
        value.set(0);
        //
        System.out.println(value.incrementAndGet()== 1);
        System.out.println(value.getAndAdd(2)== 1);
        System.out.println(value.getAndSet(5)== 3);
        //System.out.println(value.get());
        System.out.println(value.get()== 5);
        //
        final int threadSize = 10;
        Thread[] ts = new Thread[threadSize];
        for (int i = 0; i < threadSize; i++) {
            ts[i] = new Thread() {
                public void run() {
                    int original=value.get();
                    value.incrementAndGet();
                    System.out.println(value.get()-original==1);
                }
            };
        }
        //
        for(Thread t:ts) {
            t.start();
        }
        for(Thread t:ts) {
            t.join();
        }
        //
        System.out.println(value.get()== 5 + threadSize);
    }

}