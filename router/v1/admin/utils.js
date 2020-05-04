const removeExistedImages = async(previousImages, images) => {
    for(let i =0;i<previousImages.length;i++){
        let isExisted = false;
        for(let j=0;j<images.length;j++){
            if(previousImages[i].address == images[j]){
                images.splice(j, 1);
                j--;
                isExisted = true;
            }
        }
        if(isExisted){
            previousImages.splice(i, 1);
            i--;
        }
    }
    return {previousImages, images}
}

module.exports = {
    removeExistedImages
}