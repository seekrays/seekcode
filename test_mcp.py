#!/usr/bin/env python3
"""
MCP 服务器测试脚本
用于测试 SeekCode MCP 服务器的各种功能
"""

import json
import socket
import time


class McpClient:
    def __init__(self, host="127.0.0.1", port=8080):
        self.host = host
        self.port = port
        self.socket = None

    def connect(self):
        """连接到 MCP 服务器"""
        try:
            self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.socket.connect((self.host, self.port))
            print(f"Connected to MCP server at {self.host}:{self.port}")
            return True
        except Exception as e:
            print(f"Failed to connect: {e}")
            return False

    def disconnect(self):
        """断开连接"""
        if self.socket:
            self.socket.close()
            self.socket = None
            print("Disconnected from MCP server")

    def send_request(self, method, params=None, request_id=None):
        """发送 JSON-RPC 请求"""
        if not self.socket:
            raise Exception("Not connected to server")

        request = {
            "method": method,
            "params": params or {},
            "id": request_id or str(int(time.time()))
        }

        request_str = json.dumps(request) + "\r\n"
        self.socket.send(request_str.encode())

        # 接收响应
        response = ""
        while True:
            data = self.socket.recv(4096).decode()
            response += data
            if "\r\n" in response:
                break

        try:
            return json.loads(response.strip())
        except json.JSONDecodeError:
            return {"error": "Invalid JSON response", "raw": response}

    def send_simple_command(self, command):
        """发送简单的文本命令"""
        if not self.socket:
            raise Exception("Not connected to server")

        command_str = command + "\r\n"
        self.socket.send(command_str.encode())

        # 接收响应
        response = ""
        while True:
            data = self.socket.recv(4096).decode()
            response += data
            if "\r\n" in response:
                break

        return response.strip()


def test_mcp_server():
    """测试 MCP 服务器功能"""
    client = McpClient()

    print("=== MCP 服务器测试 ===\n")

    # 连接服务器
    if not client.connect():
        print("无法连接到服务器，请确保 MCP 服务器正在运行")
        return

    try:
        # 测试 1: 简单命令
        print("1. 测试简单的 list 命令:")
        response = client.send_simple_command("list")
        print(f"Response: {response[:200]}...")
        print()

        # 测试 2: JSON-RPC 获取代码片段列表
        print("2. 测试 JSON-RPC snippet.list:")
        response = client.send_request("snippet.list")
        print(f"Response: {json.dumps(response, indent=2, ensure_ascii=False)}")
        print()

        # 测试 3: 获取统计信息
        print("3. 测试 snippet.stats:")
        response = client.send_request("snippet.stats")
        print(f"Response: {json.dumps(response, indent=2, ensure_ascii=False)}")
        print()

        # 测试 4: 搜索代码片段
        print("4. 测试 snippet.search:")
        response = client.send_request("snippet.search", {"query": "function"})
        print(f"Response: {json.dumps(response, indent=2, ensure_ascii=False)}")
        print()

        # 测试 5: 创建代码片段
        print("5. 测试 snippet.create:")
        new_snippet = {
            "id": 0,  # 新创建时 ID 会被忽略
            "title": "Test Snippet",
            "language": "python",
            "code": "def hello():\n    print('Hello, World!')",
            "tags": "[\"test\", \"example\"]",
            "created_at": "",
            "updated_at": ""
        }
        response = client.send_request("snippet.create", new_snippet)
        print(f"Response: {json.dumps(response, indent=2, ensure_ascii=False)}")
        print()

        # 如果创建成功，测试获取和删除
        if response.get("result") and response["result"].get("id"):
            snippet_id = response["result"]["id"]
            
            # 测试 6: 获取单个代码片段
            print(f"6. 测试 snippet.get (ID: {snippet_id}):")
            response = client.send_request("snippet.get", {"id": snippet_id})
            print(f"Response: {json.dumps(response, indent=2, ensure_ascii=False)}")
            print()

            # 测试 7: 更新代码片段
            print(f"7. 测试 snippet.update (ID: {snippet_id}):")
            updated_snippet = {
                "id": snippet_id,
                "title": "Updated Test Snippet",
                "language": "python",
                "code": "def hello_updated():\n    print('Hello, Updated World!')",
                "tags": "[\"test\", \"example\", \"updated\"]",
                "created_at": "",
                "updated_at": ""
            }
            response = client.send_request("snippet.update", {
                "id": snippet_id,
                "snippet": updated_snippet
            })
            print(f"Response: {json.dumps(response, indent=2, ensure_ascii=False)}")
            print()

            # 测试 8: 删除代码片段
            print(f"8. 测试 snippet.delete (ID: {snippet_id}):")
            response = client.send_request("snippet.delete", {"id": snippet_id})
            print(f"Response: {json.dumps(response, indent=2, ensure_ascii=False)}")
            print()

        # 测试 9: 按语言筛选
        print("9. 测试 snippet.by_language:")
        response = client.send_request("snippet.by_language", {"language": "python"})
        print(f"Response: {json.dumps(response, indent=2, ensure_ascii=False)}")
        print()

        # 测试 10: 未知方法
        print("10. 测试未知方法:")
        response = client.send_request("unknown.method")
        print(f"Response: {json.dumps(response, indent=2, ensure_ascii=False)}")
        print()

    except Exception as e:
        print(f"测试过程中发生错误: {e}")
    finally:
        client.disconnect()

    print("=== 测试完成 ===")


if __name__ == "__main__":
    test_mcp_server()
