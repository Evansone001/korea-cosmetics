import gs_logo from "./gs_logo.jpg"
import korea_logo from "./korea_logo.png"
import upload_area from "./upload_area.svg"
import essence from "./essence.jpg"
import anna_keibalo from "./anna-keibalo.jpg"
import elena_soroka from "./elena-soroka.jpg"
import maria_lupan from "./maria-lupan.jpg"
import valeriia_miller from "./valeriia-miller.jpg"
import { Clock, HeadsetIcon, SendIcon } from "lucide-react";

export const assets = {
    upload_area, essence, anna_keibalo, elena_soroka, maria_lupan, valeriia_miller,
    gs_logo, korea_logo,
}

export const categories = ["Skincare", "Makeup", "Hair Care", "Body Care", "Lip Care", "Sun Care"];

export const ourSpecsData = [
    { title: "Free Shipping", description: "Enjoy fast, free delivery on every order no conditions, just reliable doorstep.", icon: SendIcon, accent: '#05DF72' },
    { title: "7 Days easy Return", description: "Change your mind? No worries. Return any item within 7 days.", icon: Clock, accent: '#FF8904' },
    { title: "24/7 Customer Support", description: "We're here for you. Get expert help with our customer support.", icon: HeadsetIcon, accent: '#A684FF' }
]
