
<?php
include 'includes/db_connection.php';

$message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $email    = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm  = $_POST['confirm'] ?? '';

    if ($username === '' || $email === '' || $password === '' || $confirm === '') {
        $message = 'All fields are required.';
    } elseif ($password !== $confirm) {
        $message = 'Passwords do not match.';
    } else {
        // hash the password
        $hash = password_hash($password, PASSWORD_DEFAULT);

  // insert into DB
        $stmt = $conn->prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)");
        if (!$stmt) {
            $message = 'Database error: ' . $conn->error;
        } else {
            $stmt->bind_param('sss', $username, $email, $hash);

            if ($stmt->execute()) {
                $message = 'Registration successful. You can now log in.';
            } else {
                // likely duplicate email
                $message = 'Error: unable to register (email may already be in use).';
            }

            $stmt->close();
        }
    }      
}
?>



<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register</title>
    
    <!-- CSS -->
    <link rel="stylesheet" href="assets/css/index.css"/>
    <link rel="stylesheet" href="assets/css/login.css"/>
    <link href='https://cdn.boxicons.com/3.0.6/fonts/basic/boxicons.min.css' rel='stylesheet'>
    <link rel="stylesheet" href="assets/css/register.css"/>
</head>
<body class="register-page">
    <?php if ($message !== '') { echo '<p>' . htmlspecialchars($message) . '</p>'; } ?>
    <div class="wrapper">
        <h1>Register</h1>

        <form action="register.php" method="POST">

            <div class="input-box">
                <input type="text" id="username" name="username" placeholder="Enter username" required>
                <i class='bxr bx-user bx-flip-horizontal'></i>
            </div>

            <div class="input-box">
                <input type="email" id="email" name="email" placeholder="Enter email" required>
                <i class='bxr bx-envelope bx-flip-horizontal'></i>
            </div>

            <div class="input-box">
                <input type="password" id="password" name="password" placeholder="Enter password" required>
                <i class='bxr bx-lock bx-flip-horizontal'></i>
            </div>

            <div class="input-box">
                <input type="password" id="confirm" name="confirm" placeholder="Confirm password" required>
                <i class='bxr bx-lock bx-flip-horizontal'></i>
            </div>

            <div class="btn-box">
                <button type="submit">Register</button>
            </div>

            <!-- Back to Login as link -->
            <div class="login-link">
                <p>Already have an account? <a href="login.php">Login</a></p>
            </div>

        </form>
    </div>
</body>
</html>
