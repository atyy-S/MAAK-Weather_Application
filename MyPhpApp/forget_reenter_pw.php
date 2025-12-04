<?php
// forgot_reenter_pw.php
session_start();
include 'includes/db_connection.php';

// ensure user came from forgot_main.php and we have their email
if (!isset($_SESSION['reset_email'])) {
    header('Location: forgot_main.php');
    exit;
}

$message = '';
$isError = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $newPassword = $_POST['password'] ?? '';
    $confirm     = $_POST['confirm_password'] ?? '';

    if ($newPassword === '' || $confirm === '') {
        $message = "All fields are required.";
        $isError = true;
    } elseif ($newPassword !== $confirm) {
        $message = "Passwords do not match.";
        $isError = true;
    } else {
        $hash  = password_hash($newPassword, PASSWORD_DEFAULT);
        $email = $_SESSION['reset_email'];

        $stmt = $conn->prepare("UPDATE users SET password_hash = ? WHERE email = ?");
        if ($stmt) {
            $stmt->bind_param("ss", $hash, $email);
            if ($stmt->execute()) {
                $message = "Password reset successful. You can now log in.";
                $isError = false;
                unset($_SESSION['reset_email']);  // no longer needed
            } else {
                $message = "Unable to reset password. Please try again.";
                $isError = true;
            }
            $stmt->close();
        } else {
            $message = "System error. Please try again later.";
            $isError = true;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password</title>

    <link rel="stylesheet" href="assets/css/index.css"/>
    <link rel="stylesheet" href="assets/css/login.css"/>
</head>
<body class="forget-page">
    <div class="wrapper">
        <h1>Reset Password</h1>

        <?php
        if ($message !== '') {
            $class = $isError ? "error" : "success";
            echo '<p class="' . $class . '">' . htmlspecialchars($message) . '</p>';
        }
        ?>

        <form method="POST" action="forget_reenter_pw.php">
            <div class="input-box">
                <input type="password" name="password" placeholder="New password" required>
            </div>

            <div class="input-box">
                <input type="password" name="confirm_password" placeholder="Confirm new password" required>
            </div>

            <div class="btn-box">
                <button type="submit">Reset Password</button>
            </div>

            <div class="login-link">
                <p><a href="login.php">Back to Login</a></p>
            </div>
        </form>
    </div>
</body>
</html>
