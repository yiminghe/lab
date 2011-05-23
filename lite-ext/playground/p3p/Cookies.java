import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class Cookies extends HttpServlet {
	public void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		if (request.getParameter("set") != null) {
			// ie need this
			response.addHeader("P3P", "CP=\"CAO PSA OUR\"");
			System.out.println(request.getPathInfo());
			response.addCookie(new Cookie("logined", "ok"));
			response.sendRedirect(request.getContextPath() + request.getServletPath());

		} else {
			Cookie[] cs = request.getCookies();
			if (cs != null) {
				for (Cookie c : cs) {
					if (c.getName().equals("logined")) {
						response.getWriter().println("logined : " + c.getValue());
					}
				}
			}

		}
	}

	public void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		this.doGet(request, response);
	}
}
