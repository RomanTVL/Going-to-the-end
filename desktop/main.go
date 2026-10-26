// Command going-to-the-end wraps the game in a native Windows window.
//
// The page and its fonts are embedded in the executable and unpacked into the
// user's local app data on every launch, then shown through WebView2, which
// ships with Windows 10 and 11. Without WebView2 the game opens in the default
// browser instead.
package main

import (
	"embed"
	"io/fs"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"

	webview2 "github.com/jchv/go-webview2"
)

//go:embed web
var web embed.FS

const appName = "GoingToTheEnd"

func main() {
	base, err := os.UserCacheDir() // %LocalAppData% on Windows
	if err != nil {
		base = os.TempDir()
	}
	root := filepath.Join(base, appName)
	page, err := unpack(filepath.Join(root, "web"))
	if err != nil {
		os.Exit(1)
	}
	// a fixed file:// location and data folder keep records and the ghost between launches
	target := (&url.URL{Scheme: "file", Path: "/" + filepath.ToSlash(page)}).String()

	w := webview2.NewWithOptions(webview2.WebViewOptions{
		DataPath:  filepath.Join(root, "webview"),
		AutoFocus: true,
		WindowOptions: webview2.WindowOptions{
			Title:  "Going to the End",
			Width:  640,
			Height: 860,
			IconId: 2, // resource 1 is the manifest, 2 the icon group
			Center: true,
		},
	})
	if w == nil {
		_ = exec.Command("rundll32", "url.dll,FileProtocolHandler", target).Start()
		return
	}
	defer w.Destroy()
	w.Navigate(target)
	w.Run()
}

// unpack writes the embedded site to dir and returns the path of its index page.
func unpack(dir string) (string, error) {
	err := fs.WalkDir(web, "web", func(p string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		rel, _ := filepath.Rel("web", filepath.FromSlash(p))
		out := filepath.Join(dir, rel)
		if d.IsDir() {
			return os.MkdirAll(out, 0o755)
		}
		data, err := web.ReadFile(p)
		if err != nil {
			return err
		}
		return os.WriteFile(out, data, 0o644)
	})
	return filepath.Join(dir, "index.html"), err
}
