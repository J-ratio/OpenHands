import { FakeMessage } from "./fake_message";

export const DEBUG_CRASH_LOGS_MESSAGES: Array<FakeMessage> = [
  {
    type: "user",
    message: "/analyze_crash_logs crash_logs.txt",
    delay: 0,
  },
  {
    type: "environment",
    message:
      "```bash\n$ cat crash_logs.txt\n```\n\n<details>\n<summary>Contents of crash_logs.txt</summary>\n\n```log\n[    3.410102] imx219 1-0010: powering on...\n[    3.415521] imx219 1-0010: regulators enabled (bulk)\n[    3.420114] imx219 1-0010: clock enabled\n[    3.423922] imx219 1-0010: XCLR asserted high\n[    3.428331] imx219 1-0010: i2c transfer failed (-121)\n[    3.433722] imx219 1-0010: sensor not detected\n[    3.438045] imx219 1-0010: probe failed: -121\n[    3.442431] ------------[ cut here ]------------\n[    3.446500] WARNING: CPU: 0 PID: 1 at drivers/media/i2c/imx219.c:547 imx219_probe+0x1a0/0x2f0\n[    3.455002] Modules linked in: v4l2_fwnode videodev media i2c_core clk_common\n[    3.461915] CPU: 0 PID: 1 Comm: swapper/0 Not tainted 6.6.15-custom #1\n[    3.468122] Hardware name: Raspberry Pi 4 Model B Rev 1.4 (DT)\n[    3.473889] pstate: 80000005 (Nzcv daif -PAN -UAO -TCO -DIT -SSBS BTYPE=--)\n[    3.480987] pc : imx219_probe+0x1a0/0x2f0\n[    3.485189] lr : imx219_probe+0x160/0x2f0\n[    3.489387] sp : ffff80008003bb20\n[    3.492781] x29: ffff80008003bb20 x28: ffff00000123c000\n[    3.497883] x27: 0000000000000000 x26: ffff00000082d600\n[    3.502986] x25: 0000000000000001 x24: 0000000000000000\n[    3.508087] x23: ffff00000082d000 x22: ffff00000082d400\n[    3.513189] x21: ffff00000082d800 x20: ffff00000123c010\n[    3.518291] x19: ffff000000a4c000 x18: 0000000000000000\n[    3.523393] x17: 0000000000000000 x16: 0000000000000000\n[    3.528495] x15: ffff800080e3e000 x14: 0000000000000000\n[    3.533597] x13: ffff800080e3e000 x12: ffff800080e3e000\n[    3.538699] x11: 0000000000000000 x10: 0000000000000001\n[    3.543801] x9 : 0000000000000000 x8 : 0000000000000000\n[    3.548903] x7 : 0000000000000000 x6 : 0000000000000000\n[    3.554005] x5 : 0000000000000000 x4 : 0000000000000000\n[    3.559107] x3 : 0000000000000000 x2 : 0000000000000000\n[    3.564209] x1 : ffff000000a4c000 x0 : 0000000000000000\n[    3.569311] Call trace:\n[    3.571745]  imx219_probe+0x1a0/0x2f0\n[    3.575596]  i2c_device_probe+0x60/0x150\n[    3.579702]  really_probe+0xc0/0x300\n[    3.583381]  __driver_probe_device+0x84/0xf0\n[    3.587837]  driver_probe_device+0x38/0x110\n[    3.592203]  __driver_attach+0xc4/0x180\n[    3.596056]  bus_for_each_dev+0x78/0xd0\n[    3.599908]  driver_attach+0x28/0x40\n[    3.603492]  bus_add_driver+0x110/0x220\n[    3.607345]  driver_register+0x64/0x120\n[    3.611199]  i2c_register_driver+0x44/0x80\n[    3.615303]  do_one_initcall+0x50/0x220\n[    3.619155]  kernel_init_freeable+0x1b0/0x210\n[    3.623523]  kernel_init+0x28/0x130\n[    3.627115]  ret_from_fork+0x10/0x20\n[    3.630696] ---[ end trace 3d7f1bc49a8f2a15 ]---\n[    3.635050] Kernel panic - not syncing: camera sensor probe failed\n[    3.641042] CPU: stopping\n```\n\n</details>",
    delay: 2000,
  },
  {
    type: "agent",
    message: "I can see the issue from provided crash logs!",
    delay: 1000,
  },
  {
    type: "agent",
    message:
      "Current code violates order because bulk enabling does not enforce this sequence.\n\nAnalyzing the system's behavior, it appears there might be an issue with the regulator configuration or GPIO timing, potentially leading to an incomplete reset before an I²C transaction. A missing delay after power-up is also a strong candidate. Furthermore, the device tree might be misconfigured, specifically concerning clock frequency or reset GPIOs.\n\nReferencing the datasheet (Fig. 38, Fig. 40), the prescribed power-on sequence is **VDDL → VANA → VDIG**. Crucially, **XCLR must rise at least 0.5 µs after all VDDs are stable**, and a **minimum of 6 ms after XCLR is required before standby release**. The current code seems to violate this sequence because the bulk enabling method does not enforce the specified order.",
    delay: 3000,
  },
  {
    type: "agent",
    message:
      "Here's the corrected Driver code:\n\n```c\nstatic int imx219_power_on(struct device *dev)\n{\n\tstruct v4l2_subdev *sd = dev_get_drvdata(dev);\n\tstruct imx219 *imx219 = to_imx219(sd);\n\tint ret;\n\n\t/* Enable supplies in correct datasheet order: VDDL -> VANA -> VDIG */\n\tret = regulator_enable(imx219->supplies[IMX219_VDDL].consumer);\n\tif (ret)\n\t\tgoto err_vddl;\n\tusleep_range(2000, 2500); /* allow rail to settle */\n\n\tret = regulator_enable(imx219->supplies[IMX219_VANA].consumer);\n\tif (ret)\n\t\tgoto err_vana;\n\tusleep_range(2000, 2500);\n\n\tret = regulator_enable(imx219->supplies[IMX219_VDIG].consumer);\n\tif (ret)\n\t\tgoto err_vdig;\n\tusleep_range(5000, 6000);\n\n\t/* Enable external clock */\n\tret = clk_prepare_enable(imx219->xclk);\n\tif (ret)\n\t\tgoto err_clk;\n\n\t/* Assert reset only after rails + clk stable (t3 ≥ 0.5 µs) */\n\tusleep_range(1000, 1500);\n\tgpiod_set_value_cansleep(imx219->reset_gpio, 1);\n\n\t/* Wait t5 ≥ 6ms before sensor ready */\n\tmsleep(6);\n\n\treturn 0;\n\nerr_clk:\n\tregulator_disable(imx219->supplies[IMX219_VDIG].consumer);\nerr_vdig:\n\tregulator_disable(imx219->supplies[IMX219_VANA].consumer);\nerr_vana:\n\tregulator_disable(imx219->supplies[IMX219_VDDL].consumer);\nerr_vddl:\n\treturn ret;\n}\n\nstatic int imx219_power_off(struct device *dev)\n{\n\tstruct v4l2_subdev *sd = dev_get_drvdata(dev);\n\tstruct imx219 *imx219 = to_imx219(sd);\n\n\t/* Deassert reset first */\n\tgpiod_set_value_cansleep(imx219->reset_gpio, 0);\n\n\t/* Disable supplies in reverse order (VDIG → VANA → VDDL) */\n\tregulator_disable(imx219->supplies[IMX219_VDIG].consumer);\n\tregulator_disable(imx219->supplies[IMX219_VANA].consumer);\n\tregulator_disable(imx219->supplies[IMX219_VDDL].consumer);\n\n\tclk_disable_unprepare(imx219->xclk);\n\n\treturn 0;\n}\n```",
    delay: 5000,
  },
];
