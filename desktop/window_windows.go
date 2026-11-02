package main

import (
	"unsafe"

	"golang.org/x/sys/windows"
)

// Win32 calls for sizing the window to the monitor and for borderless fullscreen.
var (
	user32             = windows.NewLazySystemDLL("user32.dll")
	getSystemMetrics   = user32.NewProc("GetSystemMetrics")
	getWindowLongPtr   = user32.NewProc("GetWindowLongPtrW")
	setWindowLongPtr   = user32.NewProc("SetWindowLongPtrW")
	getWindowRect      = user32.NewProc("GetWindowRect")
	setWindowPos       = user32.NewProc("SetWindowPos")
	monitorFromWindow  = user32.NewProc("MonitorFromWindow")
	getMonitorInfo     = user32.NewProc("GetMonitorInfoW")
	gwlStyle           = ^uintptr(15) // GWL_STYLE is -16
	wsOverlappedWindow = uintptr(0x00CF0000)
)

const (
	smCxScreen          = 0
	smCyScreen          = 1
	monitorNearest      = 2
	swpNoZOrder         = 0x0004
	swpFrameChanged     = 0x0020
	swpNoOwnerZOrder    = 0x0200
	hwndTopmostRestored = 0
)

type rect struct{ Left, Top, Right, Bottom int32 }

type monitorInfo struct {
	Size    uint32
	Monitor rect
	Work    rect
	Flags   uint32
}

// windowSize picks a portrait window that fits the screen: the game screen is 4:5 plus the slate below it.
func windowSize() (uint, uint) {
	sh, _, _ := getSystemMetrics.Call(smCyScreen)
	sw, _, _ := getSystemMetrics.Call(smCxScreen)
	if sh == 0 || sw == 0 {
		return 640, 860
	}
	h := uint(float64(sh) * .88)
	w := uint(float64(h) * .74)
	if w > uint(sw) {
		w = uint(sw)
	}
	return w, h
}

// fullscreen toggles a borderless window over the whole monitor and back.
type fullscreen struct {
	on    bool
	style uintptr
	saved rect
}

func (f *fullscreen) toggle(hwnd uintptr) bool {
	if !f.on {
		f.style, _, _ = getWindowLongPtr.Call(hwnd, gwlStyle)
		getWindowRect.Call(hwnd, uintptr(unsafe.Pointer(&f.saved)))
		mon, _, _ := monitorFromWindow.Call(hwnd, monitorNearest)
		mi := monitorInfo{Size: uint32(unsafe.Sizeof(monitorInfo{}))}
		getMonitorInfo.Call(mon, uintptr(unsafe.Pointer(&mi)))
		setWindowLongPtr.Call(hwnd, gwlStyle, f.style&^wsOverlappedWindow)
		r := mi.Monitor
		setWindowPos.Call(hwnd, hwndTopmostRestored, uintptr(r.Left), uintptr(r.Top), uintptr(r.Right-r.Left), uintptr(r.Bottom-r.Top), swpNoOwnerZOrder|swpFrameChanged)
	} else {
		setWindowLongPtr.Call(hwnd, gwlStyle, f.style)
		r := f.saved
		setWindowPos.Call(hwnd, hwndTopmostRestored, uintptr(r.Left), uintptr(r.Top), uintptr(r.Right-r.Left), uintptr(r.Bottom-r.Top), swpNoZOrder|swpNoOwnerZOrder|swpFrameChanged)
	}
	f.on = !f.on
	return f.on
}
