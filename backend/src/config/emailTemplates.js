
export const LOGIN_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html>
<body style="margin:0;background:#0f172a;font-family:Inter,Segoe UI,sans-serif;">
<table width="100%" style="padding:40px">
<tr><td align="center">

<table width="600" style="background:#fff;border-radius:14px;overflow:hidden;">
<tr>
<td style="background:#16a34a;color:#fff;padding:30px;text-align:center;">
<h1 style="margin:0">✅ Login Successful</h1>
<p>Your account was accessed successfully</p>
</td>
</tr>

<tr>
<td style="padding:30px;color:#020617">
<p>Hi <b>{{name}}</b>,</p>
<p>Your account was logged into successfully.</p>

<table style="margin:20px 0">
<tr><td><b>🌍 IP Address:</b></td><td>{{ip}}</td></tr>
<tr><td><b>⏰ Time:</b></td><td>{{time}}</td></tr>
</table>

<div style="background:#f1f5f9;padding:15px;border-left:4px solid #16a34a">
If this was you, no action is required.
</div>

<div style="margin-top:15px;background:#fff7ed;padding:15px;border-left:4px solid #f97316">
⚠️ If this wasn’t you, reset your password immediately.
</div>
</td>
</tr>

<tr>
<td style="background:#020617;color:#94a3b8;padding:15px;text-align:center;font-size:12px">
Caravan Chronicle • Security Notification
</td>
</tr>
</table>

</td></tr>
</table>
</body>
</html>
`;


// ===============================
// 🚨 TOO MANY LOGIN ATTEMPTS
// ===============================
export const TOO_MANY_LOGIN_ATTEMPTS_TEMPLATE = `
<!DOCTYPE html>
<html>
<body style="margin:0;background:#0f172a;font-family:Inter,Segoe UI,sans-serif;">
<table width="100%" style="padding:40px">
<tr><td align="center">

<table width="600" style="background:#fff;border-radius:14px;overflow:hidden;">
<tr>
<td style="background:#dc2626;color:#fff;padding:30px;text-align:center;">
<h1 style="margin:0">🚨 Too Many Login Attempts</h1>
<p>We temporarily blocked repeated login attempts</p>
</td>
</tr>

<tr>
<td style="padding:30px;color:#020617">
<p>Hi <b>{{name}}</b>,</p>

<p>We detected multiple failed login attempts on your account.</p>

<table style="margin:20px 0">
<tr><td><b>🌍 IP Address:</b></td><td>{{ip}}</td></tr>
<tr><td><b>⏰ Time:</b></td><td>{{time}}</td></tr>
</table>

<div style="background:#fef2f2;padding:15px;border-left:4px solid #dc2626">
🔒 For your security, further login attempts were blocked.
</div>
</td>
</tr>

<tr>
<td style="background:#020617;color:#94a3b8;padding:15px;text-align:center;font-size:12px">
Caravan Chronicle • Account Protection
</td>
</tr>
</table>

</td></tr>
</table>
</body>
</html>
`;


// ===============================
// 🚨 TOO MANY PASSWORD ATTEMPTS
// ===============================
export const TOO_MANY_PASSWORD_ATTEMPTS_TEMPLATE = `
<!DOCTYPE html>
<html>
<body style="margin:0;background:#0f172a;font-family:Inter,Segoe UI,sans-serif;">
<table width="100%" style="padding:40px">
<tr><td align="center">

<table width="600" style="background:#fff;border-radius:14px;overflow:hidden;">
<tr>
<td style="background:#991b1b;color:#fff;padding:30px;text-align:center;">
<h1 style="margin:0">🚨 Password Attempts Blocked</h1>
<p>Multiple incorrect password attempts detected</p>
</td>
</tr>

<tr>
<td style="padding:30px;color:#020617">
<p>Hi <b>{{name}}</b>,</p>

<p>There were too many incorrect password attempts on your account.</p>

<table style="margin:20px 0">
<tr><td><b>🌍 IP Address:</b></td><td>{{ip}}</td></tr>
<tr><td><b>⏰ Time:</b></td><td>{{time}}</td></tr>
</table>

<div style="background:#fff1f2;padding:15px;border-left:4px solid #991b1b">
⚠️ If this was not you, change your password immediately.
</div>
</td>
</tr>

<tr>
<td style="background:#020617;color:#94a3b8;padding:15px;text-align:center;font-size:12px">
Caravan Chronicle • Security Alert
</td>
</tr>
</table>

</td></tr>
</table>
</body>
</html>
`;
