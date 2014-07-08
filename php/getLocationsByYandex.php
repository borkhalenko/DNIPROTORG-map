<?php
   //$httpQuery='http://geocode-maps.yandex.ru/1.x/?geocode='.urlencode("Киев").'&key='.urlencode('AMXDtVMBAAAAY1q4HQMAzL0vx1ogFo0oHzwnwTNgbWwhTFUAAAAAAAAAAABV5e63bYvVS6qHERYxpnGQcu7-TA==').'&results=1';
   //echo $httpQuery;
   //РАСКОМЕНТИТЬ, ЕСЛДИ НУЖНО ПРИНИМАТЬ ДАННЫЕ ОТ КЛИЕНТА  
   // echo $_POST['name'] . " ". $_POST['location'];
    define("DATABASE_NAME","routesDB");
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
    mysql_close($link);
?>