import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class Binary extends HttpServlet {
	public void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		response.setContentType("text/plain;charset=ios8859-1");
		byte[] b= new byte[3];
		b[0]=8;
		b[1]=4;
		b[2]=2;
		response.getOutputStream().write(b);
	}

}
