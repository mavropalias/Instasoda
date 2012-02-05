<?php

function fetchUrl($url)
{
    $curl = curl_init($url);
    $result = false;
    
    if (is_resource($curl) === true)
    {
        curl_setopt($curl, CURLOPT_FAILONERROR, true);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);

        $result = curl_exec($curl);

        curl_close($curl);
    }

    return $result;
}

function getAge( $p_strDate ) {
    list($d,$m,$Y)    = explode("/",$p_strDate);
    return( date("md") < $m.$d ? date("Y")-$Y-1 : date("Y")-$Y );
}

?>