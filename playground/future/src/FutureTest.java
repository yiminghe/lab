import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public class FutureTest {


    private static class M {
        String t = "1";
    }


    public static void main(String[] args) throws Exception{
        ExecutorService pool = Executors.newFixedThreadPool(10);

        final M mu = new M();

        Future<M> t = pool.submit(new Callable<M>() {
            public M call() throws Exception {
                return mu;
            }
        });

        mu.t="2";

        System.out.print(System.nanoTime());

        if (t.isDone()) {
            System.out.println("future done");
        } else{
            System.out.println(t.get().t);
        }

        System.out.print(System.nanoTime());

    }
}
