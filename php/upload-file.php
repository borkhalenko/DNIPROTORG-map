<?php
    require_once "geocoder.php";
    $uploaddir = './uploads/';
    //$file = $uploaddir . basename($_FILES['uploadfile']['name']); 
    $file=$uploaddir."routes.xls";
    if (move_uploaded_file($_FILES['uploadfile']['tmp_name'], $file)) {echo "success";}
    else {echo "error";}

    define("DATABASE_NAME","routesDB");
    //including external component
    error_reporting(E_ALL ^ E_NOTICE);
    require_once 'sided/excel_reader2.php';

    //opening the file
    $excelFile = new Spreadsheet_Excel_Reader("uploads/routes.xls",FALSE,"UTF-8");

    //getting the array of the routes (unique elements)
    $numOfItems=0;
    while ($excelFile->val($numOfItems+1,3)){
        $ttNumbers[$numOfItems]=intval($excelFile->val($numOfItems+1,2));
        $ttNames[$numOfItems]=iconv("WINDOWS-1251","UTF-8",$excelFile->val($numOfItems+1,3));
        $ttAddresses[$numOfItems]=iconv("WINDOWS-1251","UTF-8",$excelFile->val($numOfItems+1,4));
        $ttPriorities[$numOfItems]=intval($excelFile->val($numOfItems+1,5));
        $ttRoutes[$numOfItems]=iconv("WINDOWS-1251","UTF-8",$excelFile->val($numOfItems+1,6));
        $numOfItems++;
    }
    $uniqueRoutesArray=array_unique($ttRoutes);

    if(!$link=mysql_connect("localhost","iAdmin","6502")){
        echo "Cannot connect to the database";
        exit();
    }
    if (!mysql_select_db(DATABASE_NAME,$link)){
        echo "Cannot select the database "+DATABASE_NAME;
        mysql_close($link);
        exit();
    }

    //resolving charset problem 
    mysql_query("SET NAMES 'utf8'");
    $truncate_query="TRUNCATE TABLE `routes`";
    if (!mysql_query($truncate_query,$link)){
        echo "Cannot eject the query: TRUNCATE TABLE routes";
        mysql_close($link);
        exit();
    }

    $truncate_query="TRUNCATE TABLE `contractors`";
    if (!mysql_query($truncate_query,$link)){
            echo "Cannot eject the query: TRUNCATE TABLE contractors";
            mysql_close($link);
            exit();
        }

    //add values in array into mySQL
    foreach ($uniqueRoutesArray as $key=>$value){
        $sql_query="INSERT INTO routes (route_name) VALUES ('".$value."')";
        if (!mysql_query($sql_query,$link)){
            echo "Cannot eject the query";
            mysql_close($link);
            exit();
        }
    }

    for ($i=0;$i<$numOfItems;++$i){
        if ($ttNumbers[$i]){
            $currentNumber=$ttNumbers[$i];    
        }
        else{
            $currentNumber=0;
        }
        
        $currentName=str_replace(' " ', '', $ttNames[$i]);
        $currentAddress=str_replace(' " ', '', $ttAddresses[$i]);
        $currentName=str_replace(' " ', '', $currentName);
        $currentAddress=str_replace(' " ', '', $currentAddress);
        $currentPriority=$ttPriorities[$i];

        $querySelect="SELECT `route_id` FROM `routes` WHERE `route_name`='".$ttRoutes[$i]."' LIMIT 0, 30 ";
        if (!$result=mysql_query($querySelect,$link)){
            echo "Cannot select route_id from routes";
            mysql_close($link);
            exit();
        }
        $parsedResult=mysql_fetch_array($result);
        $currentRoute=$parsedResult['route_id'];
        //$queryInsert="INSERT INTO contractors (route_id,contractor_name,contractor_address,contractor_priority,tt_number,lat,lng) VALUES ('".$currentRoute."','".$currentName."','".$currentAddress."','".$currentPriority."','".$currentNumber."','".$currentLat."','".$currentLng."')";
        $queryInsert="INSERT INTO contractors (route_id,contractor_name,contractor_address,contractor_priority,tt_number) VALUES ('".$currentRoute."','".$currentName."','".$currentAddress."','".$currentPriority."','".$currentNumber."')";
        if (!mysql_query($queryInsert,$link)){
          //  echo "Cannot eject the query Insert INTO contractors";
           echo $queryInsert;
            mysql_close($link);
            exit();
        }
    }

    //GEOCODE ------------------------------------GEOCODE
    //$str = implode(", ", $routesArray);
    $sql = "SELECT contractor_id, contractor_address FROM `contractors` WHERE tt_number!=0 GROUP BY tt_number ORDER BY tt_number";
    if (!$result=mysql_query($sql,$link)){
        echo "Cannot select route_id from routes";
        mysql_close($link);
        exit();
    }
    
    $countGeocode = $countGeocodeFault = 0;
    $str="";
    $httpQuery="";
    while ($row = mysql_fetch_assoc($result)) {
        $current_address=$row["contractor_address"];
        $current_id=$row["contractor_id"];
        $current_id=$row["contractor_id"];
        $countGeocode++;
        $httpQuery='http://geocode-maps.yandex.ru/1.x/?geocode='.urlencode($current_address).'&key='.urlencode('AMXDtVMBAAAAY1q4HQMAzL0vx1ogFo0oHzwnwTNgbWwhTFUAAAAAAAAAAABV5e63bYvVS6qHERYxpnGQcu7-TA==').'&results=1';
        $xml = simplexml_load_file($httpQuery);
        $found = $xml->GeoObjectCollection->metaDataProperty->GeocoderResponseMetaData->found;
        if ($found > 0){
            $coords = str_replace(' ', ',', $xml->GeoObjectCollection->featureMember->GeoObject->Point->pos);
            $sql="UPDATE `contractors` SET coords = '".mysql_real_escape_string($coords)."' WHERE contractor_id = '".$current_id."'";
            mysql_query($sql,$link);
        }
    }
     //GEOCODE ------------------------------------GEOCODE

    mysql_close($link);

?>