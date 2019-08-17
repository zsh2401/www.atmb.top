import React from 'react'
import Swiper from 'swiper';
export interface IPicSwiperProps{
    srcs:string[];
}
export default class PicSwiper extends React.Component<IPicSwiperProps>{
    componentDidMount(){
        new Swiper(".swiper-container",{
            slidesPerView: 2.3,
            spaceBetween: 40,
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            }
        });
    }
    render(){
        return <div className="swiper-container">
            <div className="swiper-wrapper">
                {this.props.srcs.map((item,index)=>{
                    return <div className="swiper-slide">
                        <img src={"/images/ext_pics/" + item}></img>
                    </div>
                })}
            </div>
        </div>
    }
}