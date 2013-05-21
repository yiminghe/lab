<?php
    $index = 0;
    $ret = array();
    while(isset($_FILES['file'.$index])){
        $file=$_FILES['file'.$index];
        $new=array();
        $new['name'] = $file['name'];
        $new['size']=$file['size'];
        $ret[]=$new;
        $index++;
    }
    echo json_encode($ret);
?>