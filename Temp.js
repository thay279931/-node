//※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※
//canvas儲存成檔案
const saveCanvas = () => {
    //先轉成字串					
    const image = myCanvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    // location.href = image;
    //創建偽元素
    let a = document.createElement('a');
    //下載
    a.setAttribute('download', 'draw.png');
    //連結  獲得字串
    a.setAttribute('href', image);
    //強制觸發
    a.click();
};
//※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※

        