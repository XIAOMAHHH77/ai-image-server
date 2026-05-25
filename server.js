const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// 根路径返回网页
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 文本生成图片接口（通义千问，只需要描述词，不用上传图片）
app.post('/api/generate', async (req, res) => {
    try {
        const { apiKey, prompt } = req.body;

        if (!apiKey || !prompt) {
            return res.json({ code: -1, msg: '参数缺失：请填写API Key和描述词' });
        }

        // 调用通义千问文本生成图片API
        const response = await axios.post(
            'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis',
            {
                model: "qwen-text2image-xl",
                input: { prompt: prompt },
                parameters: { size: "1024*1024" }
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
        console.error('生成失败:', err.response?.data || err.message);
        res.json({ 
            code: -1, 
            msg: '生成失败：' + (err.response?.data?.message || err.message)
        });
    }
});

app.listen(port, () => {
    console.log(`服务运行在端口 ${port}`);
});
