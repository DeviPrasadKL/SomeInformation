import axios from 'axios';
import React, { useEffect, useState } from 'react';

export default function PromisesAndAxios() {

    const [apiData, setapiData] = useState([]);
    const [postData, setpostData] = useState([]);
    const [searchWord, setsearchWord] = useState(573201);

    function fetchDetails() {
        let anime = new Promise((resolve, reject) => {
            axios.get("https://api.jikan.moe/v4/anime")
                .then((res) => {
                    setapiData(res.data.data);
                })
            if (resolve) {
                resolve();
            } else if (reject) {
                reject();
            }
        })
        return anime;
    }

    function fetchPin() {
        var pin = new Promise((resolve, reject) => {
            setTimeout(() => {
                axios.get("https://api.postalpincode.in/pincode/" + searchWord)
                    .then((res) => {
                        setpostData(res.data[0].PostOffice);
                    }).catch((err) => console.log(err.message))
                if (resolve) {
                    resolve();
                } else if (reject) {
                    reject();
                }
            }, 5000)
        })
        return pin;
    }

    let allPromisea = () => {
        // let anime = fetchDetails();
        // let pin = fetchPin();
        Promise.all([fetchDetails(), fetchPin()])
        // Promise.all([anime, pin])
            .then(() => { printResolved() })
    }

    let printResolved = () => {
        window.alert("Everything is resolved")
    }


    useEffect(() => {
        allPromisea();
    }, []);

    return (
        <div>
            <div>
                {postData.map((datas) => {
                    return (
                        <h1>{datas.Name}</h1>
                    )
                })
                }
            </div>
            <div>
                {apiData.map((datas) => {
                    return (
                        <h3>{datas.title}</h3>
                    )
                })
                }
            </div>
            <input type="text" value={searchWord} onChange={(e) => setsearchWord(e.target.value)} />
            <h2>{searchWord}</h2>
        </div>
    );
}
