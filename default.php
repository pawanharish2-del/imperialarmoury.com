<?php
// Prevent Hostinger default page from hijacking index.html
header("HTTP/1.1 301 Moved Permanently");
header("Location: /");
exit();
?>