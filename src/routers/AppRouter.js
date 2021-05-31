import React, { useState } from 'react'
import axios from 'axios'
import { css } from '@emotion/react'
import BounceLoader from "react-spinners/BounceLoader";
import 'react-tree-graph/dist/style.css'
import Tree from 'react-tree-graph';


const override = css`
  display: block;
  margin: 0 auto;
`;

const AppRouter = () => {
    const [result, setResult] = useState({})
    const [loading, setLoading] = useState(false);
    const [color] = useState("#55ddc3");
    const [treeData, setTreeData] = useState()
    const [pageWidth, setPageWidth] = useState(window.innerWidth)
    const [openModal, setOpenModal] = useState(null)


    const handleResize = () => {
        setPageWidth(window.innerWidth)
    }
    window.addEventListener('resize', handleResize)

    const onSubmitGetLinks = async (e) => {
        e.preventDefault()
        setResult([])
        await axios.post('http://localhost:3000/start', {
            url: e.target.startUrl.value,
            maxDepth: e.target.maxDepth.value,
            maxPages: e.target.maxPages.value,
        });
        startLoading()
    }

    const startLoading = () => {
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
            setList()
        }, 10000)
    }

    const setList = async () => {

        const parseChildren = (children, tree) => {
            const ret = []
            children.forEach(child => {
                ret.push({
                    name: getIndexOfNode(child.data.url, tree),
                    children: parseChildren(child.children, tree)
                })
            })
            return ret
        }

        try {
            let tree
            await axios.get('http://localhost:3000/getTree').then(res => tree = res.data)

            if (tree) {
                setResult(tree.dataArr)
                const data = {
                    name: 0,
                    children: parseChildren(tree.root.children, tree.dataArr)
                }
                setTreeData(data)
            }

        } catch (e) {
            console.log(e.message)
        }
    }

    const refresh = async () => {
        await axios.post('http://localhost:3000/start', {
            url: document.getElementById("url").value,
            maxDepth: document.getElementById("max-depth").value,
            maxPages: document.getElementById("max-pages").value,
        });

        await setList()
    }

    const onNodeClick = (e, nodeKey) => {
        setOpenModal(result[nodeKey])
    }

    const onModalClick = (e, nodeKey) => {
        setOpenModal(null)
    }

    const getIndexOfNode = (url, tree) => {
        for (let i = 0; i < tree.length; i++) {
            if (url === tree[i].url)
                return i
        }
    }

    return (
        <div className="container">
            <h1>Spider Service</h1>
            <img alt="spidey" src="./spidey.png" />
            <form onSubmit={onSubmitGetLinks} >
                <div>
                    <label>URL: </label>
                    <input id="url" placeholder="Enter a url" name="startUrl" />
                </div>
                <div>
                    <label>Max Depth: </label>
                    <input id="max-depth" type="number" placeholder="Enter max depth" name="maxDepth" />
                </div>
                <div>
                    <label>Max Pages: </label>
                    <input id="max-pages" type="number" placeholder="Enter max pages" name="maxPages" />
                </div>
                <button type="submit">Search</button>
                <button type="button" onClick={refresh}>Refresh List</button>
            </form>
            <BounceLoader color={color} loading={loading} css={override} size={100} />
            <div className="results">
                {treeData && <Tree data={treeData}
                    height={400}
                    width={pageWidth - 100}
                    gProps={{
                        onClick: onNodeClick
                    }}
                    svgProps={{
                        className: 'custom'
                    }}

                />}
                {openModal && <>
                    <div id="modal" onClick={onModalClick} />
                    <div id="modal-content">
                        <h3>Title: <span>{openModal.title}</span></h3>
                        <h3>Url: <span>{openModal.url}</span></h3>
                        <h3>Depth: <span>{openModal.depth}</span></h3>
                        <h3>Links: <span>{openModal.links?.map(link => <p key={link}>{link}</p>)}</span></h3>
                    </div>
                </>}
            </div>

        </div>
    )
}
export default AppRouter


