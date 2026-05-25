const express = require('express');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
const path = require('path');
const upload = multer();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 1. 新增根路径路由：访问网站根目录时，返回 index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

// 2. 核心生成接口（和之前一样）
app.post('/api/generate', upload.none(), async (req, res) => {
    try {
        const { apiKey, imageBase64, prompt } = req.body;
        
        if (!apiKey || !imageBase64 || !prompt) {
            return res.json({ code: -1, msg: '参数缺失：请填写API Key、上传图片和描述词' });
        }

        const response = await axios.post(
            'https://dashscope.aliyuncs.com/api/v1/services/aigc/image2image/image-synthesis',
            {
                model: "qwen-image-2.0",
                input: {
                    reference_image: imageBase64,
                    prompt: prompt
                },
                parameters: {
                    size: "1024*1024"
                }
            },
            {
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                }
            }
        );

        res.json(response.data);
    } catch (err) {
        console.error('接口调用失败:', err.response?.data || err.message);
        res.json({ 
            code: -1, 
            msg: '生成失败：' + (err.response?.data?.message || err.message)
        });
    }
});

app.listen(port, () => {
    console.log(`后端服务运行成功！端口：${port}`);
});