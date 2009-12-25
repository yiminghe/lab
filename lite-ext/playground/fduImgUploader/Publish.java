import java.io.BufferedOutputStream;
import java.io.BufferedReader;
import java.io.Console;
import java.io.File;
import java.io.FileFilter;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Properties;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.Adler32;
import java.util.zip.CheckedOutputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

/**
@author: http://yiminghe.javaeye.com
@date: 20091225
*/
public class Publish {

	public static String[] Need_Compressed = { "base", "TabPanelLite",
			"WindowLite" };
	private static int BUFFER = 1024;

	private static String getCurrentFolder() {
		Properties properties = System.getProperties();
		return properties.getProperty("user.dir");
	}

	/**
	 * 先判断白名单，后判断黑名单，目录名不包括 svn ，文件名不符合黑名单，符合白名单就通过
	 * 
	 * @param zipOutput
	 *            zip流
	 * @param srcDir
	 *            要压缩文件所在目录
	 * @param basePath
	 *            压缩包内的开始路径
	 * @param whiteFileList
	 *            白名单
	 * @param blackFileList
	 *            黑名单
	 * @throws IOException
	 */
	private static void zipFile(ZipOutputStream zipOutput, File srcDir,
			String basePath, final String[] whiteFileList,
			final String[] blackFileList) throws IOException {
		File[] fs = srcDir.listFiles(new FileFilter() {
			public boolean accept(File curFile) {

				// 判断目录
				if (curFile.isDirectory()) {
					// 不包含 svn 配置目录
					if (curFile.getName().indexOf("svn") != -1
							&& curFile.isHidden()) {
						return false;
					} else {
						return true;
					}
				}

				// 判断文件

				if (blackFileList != null) {
					// 先判断黑名单
					for (String filter : blackFileList) {
						if (curFile.isFile()
								&& curFile.getName().endsWith(filter))
							return false;
					}
					// 接下来判断白名单
				}

				// 存在白名单
				if (whiteFileList != null) {
					for (String filter : whiteFileList) {
						if (curFile.isFile()
								&& curFile.getName().endsWith(filter))
							return true;
					}
					// 不符合白名单，为false
					return false;
				}
				// 白名单 null ,没有设置，则全部通过
				else {
					return true;
				}

			}
		});
		if (fs != null) {
			byte[] b = new byte[BUFFER];
			int len = 0;
			for (File file : fs) {
				if (file.isDirectory()) {
					zipFile(zipOutput, file, basePath + "/" + file.getName(),
							whiteFileList, blackFileList);
					continue;
				}
				FileInputStream in = new FileInputStream(file);
				zipOutput.putNextEntry(new ZipEntry(basePath + "/"
						+ file.getName()));
				while ((len = in.read(b)) != -1) {
					zipOutput.write(b, 0, len);
				}
				in.close();
			}
		}
	}

	/**
	 * 得到系统的版本号
	 * 
	 * @return verion in manifest.json
	 */
	static String getVersion() {
		String ver = "0";
		BufferedReader r = null;
		try {
			Pattern p = Pattern
					.compile("\"version\"\\s*:\\s*\"(\\d+(?:\\.\\d+)*)\"");
			Matcher m = p.matcher("");
			r = new BufferedReader(new InputStreamReader(new FileInputStream(
					"manifest.json"), "utf-8"));
			String line;
			while ((line = r.readLine()) != null) {
				m.reset(line);
				if (m.find()) {
					ver = m.group(1);
					break;
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			try {
				if (r != null)
					r.close();
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		return ver;
	}

	public static void main(String[] args) throws Exception {
		String curFolder = getCurrentFolder();
		File curFile = new File(curFolder);
		String ver = getVersion();
		String zipName = curFile.getName() + "_" + ver + ".zip";
		// Adler32 is faster than CRC32
		FileOutputStream zipFile = new FileOutputStream(zipName);
		CheckedOutputStream csum = new CheckedOutputStream(zipFile, new Adler32());
		ZipOutputStream zipOutput = new ZipOutputStream(
				new BufferedOutputStream(csum));
		zipOutput.setComment("fdu img uploader " + ver);
		File srcDir = curFile;
		//不压缩子集，黑名单zip,其他全部压缩
		zipFile(zipOutput, srcDir, curFile.getName(), null, new String[] { ".zip",".bak"  ,".class" });
		for (String curCompress : Need_Compressed) {
			srcDir = new File("../../" + curCompress);
			if (srcDir != null)
				//白名单，只压缩 css ,js ，黑名单bak，编辑器备份文件
				zipFile(zipOutput, srcDir, curFile.getName() + "/lite-ext/" + curCompress,
						new String[] { ".css", ".js" }, new String[]{".bak"});
		}
		zipOutput.close();

		System.out.println();
		System.out.println();
		System.out.println();
		System.out.println("*****************************");
		System.out.println();
		System.out.println(zipName +"  generated ! \n\n\n press enter to quit !");
		
		System.in.read();
		
	}
}
