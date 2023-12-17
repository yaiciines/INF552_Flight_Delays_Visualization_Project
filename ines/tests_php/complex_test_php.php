
<?php
echo "PHP Complex Test Script\n";
echo "-----------------------\n";

// Test 1: Array manipulation
echo "\nTest 1: Array Manipulation\n";
$fruits = ["apple", "banana", "cherry"];
foreach ($fruits as $fruit) {
    echo "Fruit: " . $fruit . "\n";
}

// Test 2: String manipulation
echo "\nTest 2: String Manipulation\n";
$originalString = "Hello World!";
$reversedString = strrev($originalString);
echo "Original: " . $originalString . "\n";
echo "Reversed: " . $reversedString . "\n";

// Test 3: Math operations
echo "\nTest 3: Math Operations\n";
$num1 = 10;
$num2 = 5;
echo "Addition: " . ($num1 + $num2) . "\n";
echo "Multiplication: " . ($num1 * $num2) . "\n";

echo "\nEnd of Test Script\n";
?>
